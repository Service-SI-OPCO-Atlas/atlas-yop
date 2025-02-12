import { InternalValidationContext, Level, ValidationContext, ValidationStatus } from "../ValidationContext"
import { ConstraintFunction, ConstraintMessage } from "./Constraint"
import { isFunction } from "../TypesUtil"
import { joinPath } from "../PathUtil"

export type TestConstraintMessage = ConstraintMessage | readonly [ConstraintMessage, Level] | boolean | undefined
export type TestConstraintFunction<Value, Parent = unknown> = ConstraintFunction<NonNullable<Value>, TestConstraintMessage, Parent>

export interface AsyncTestConstraint<Value, Parent = unknown> {
    promise: (context: ValidationContext<NonNullable<Value>, Parent>) => Promise<TestConstraintMessage>
    pendingMessage?: ConstraintMessage
    unavailableMessage?: ConstraintMessage
    getDependencies?: (context: InternalValidationContext<Value, Parent>) => any,
    shouldRevalidate?: (previous: any, current: any, status: ValidationStatus | undefined) => boolean
}

export interface TestConstraint<Value, Parent = unknown> {
    test?: TestConstraintFunction<Value, Parent> | AsyncTestConstraint<Value, Parent>
}

const defaultGetDependencies = (context: InternalValidationContext<unknown>) => context.value
const defaultShouldRevalidate = (previous: any, current: any, status: ValidationStatus | undefined) => status?.level !== "unavailable" && previous !== current

export function validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    testConstraint: TestConstraint<Value, Parent>
) {
    if (testConstraint.test == null)
        return true
    
    if (context.groups == null)
        return _validateTestConstraint(context, testConstraint)

    const groups = Array.isArray(context.groups) ? context.groups : [context.groups]
    for (const group of groups) {
        const test = (group == null ? testConstraint.test : (testConstraint as any).groups?.[group]?.test)
        if (test != null && !_validateTestConstraint(context, { test }))
            return false
    }
    return true
}

function _validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    testConstraint: TestConstraint<Value, Parent>
) {
    const test = testConstraint.test!
    if (isFunction(test))
        return _validateTestConstraintFunction(context as InternalValidationContext<NonNullable<Value>, Parent>, test)
    return _validateAsyncTestConstraint(context as InternalValidationContext<NonNullable<Value>, Parent>, test)
}

function _validateTestConstraintFunction<Value, Parent>(
    context: InternalValidationContext<NonNullable<Value>, Parent>,
    test: TestConstraintFunction<Value, Parent>
) {
    let constraint: any = undefined
    let message: any = undefined
    let level: Level | undefined = undefined

    constraint = test(context)

    if (Array.isArray(constraint)) {
        const [maybeConstraint, maybeMessage, maybeLevel] = constraint
        constraint = maybeConstraint
        message = maybeMessage
        level = maybeLevel ?? undefined
    }

    if (constraint == null || constraint === true)
        return true
    return context.setStatus("test", false, typeof constraint === "string" ? constraint : message, level ?? "error") == null
}

function _validateAsyncTestConstraint<Value, Parent>(
    context: InternalValidationContext<NonNullable<Value>, Parent>,
    test: AsyncTestConstraint<Value, Parent>
) {
    if (context.settings?.skipAsync)
        return true

    const path = joinPath(context.path)
    let asyncStatus = context.yop.asyncStatuses.get(path)
    if (asyncStatus != null) {
        const previous = asyncStatus.dependencies
        asyncStatus.dependencies = asyncStatus.getDependencies(context)
        if (!asyncStatus.shouldRevalidate(previous, asyncStatus.dependencies, asyncStatus.status)) {
            if (asyncStatus.status != null) {
                context.statuses.set(path, asyncStatus.status)
                return false
            }
            return true
        }
    }

    const getDependencies = test.getDependencies ?? defaultGetDependencies
    const shouldRevalidate = test.shouldRevalidate ?? defaultShouldRevalidate
    asyncStatus = {
        dependencies: getDependencies(context),
        getDependencies,
        shouldRevalidate
    }
    
    const promise = test.promise(context).then(message => {
        if (message == null || message === true)
            asyncStatus.status = undefined
        else if (message === false)
            asyncStatus.status = context.createStatus("test", false)
        else if (!Array.isArray(message))
            asyncStatus.status = context.createStatus("test", false, message as ConstraintMessage)
        else {
            const [maybeMessage, maybeLevel] = message as readonly [ConstraintMessage, Level]
            asyncStatus.status = context.createStatus("test", false, maybeMessage, maybeLevel ?? "error")
        }
        return asyncStatus.status
    }).catch(error => {
        asyncStatus.status = context.createStatus("test", false, error != null ? String(error) : test.unavailableMessage, "unavailable")
        return Promise.resolve(asyncStatus.status)
    })

    asyncStatus.status = context.setStatus("test", promise, test.pendingMessage, "pending")
    context.yop.asyncStatuses.set(path, asyncStatus)
    return false
}