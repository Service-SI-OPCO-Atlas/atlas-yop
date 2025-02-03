import { InternalValidationContext, Level, ValidationContext, ValidationStatus } from "../ValidationContext"
import { ConstraintFunction, ConstraintMessage } from "./Constraint"
import { isFunction, isPromise } from "../TypesUtil"
import { AsyncValidationStatus } from "../Yop"
import { joinPath } from "../PathUtil"

export type TestConstraintMessage = ConstraintMessage | readonly [ConstraintMessage, Level] | boolean | undefined

export type TestConstraintFunction<Value, Parent = unknown> = ConstraintFunction<NonNullable<Value>, TestConstraintMessage, Parent>

export type AsyncTestConstraint<Value, Parent = unknown, Dependencies = any> = {
    promise: (context: ValidationContext<Value, Parent>) => Promise<TestConstraintMessage>
    pendingMessage?: TestConstraintMessage
    getDependencies?: (context: InternalValidationContext<Value, Parent>) => Dependencies,
    shouldRevalidate?: (previous: Dependencies, current: Dependencies, status: ValidationStatus | undefined) => boolean
    debounce?: number | {
        wait: number
        immediateFirst?: boolean
    }
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
    const path = joinPath(context.path)

    if (!isFunction(test)) {
        if (context.options?.skipAsync)
            return true

        const asyncStatus = context.yop.asyncStatuses.get(path)
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
    }

    let constraint: any = undefined
    let message: any = undefined
    let level: Level | undefined = undefined

    if (isFunction(test)) {
        constraint = test(context as InternalValidationContext<NonNullable<Value>, Parent>)

        if (Array.isArray(constraint)) {
            const [maybeConstraint, maybeMessage, maybeLevel, _maybeGroup] = constraint
            constraint = maybeConstraint
            message = maybeMessage
            level = maybeLevel ?? undefined
        }
    }
    else {
        constraint = test.promise(context as InternalValidationContext<NonNullable<Value>, Parent>)
        message = test.pendingMessage
    }
    
    if (constraint == null || constraint === true)
        return true

    if (isPromise(constraint)) {
        const [getDependencies, shouldRevalidate] = isFunction(test) ?
            [defaultGetDependencies, defaultShouldRevalidate] :
            [test.getDependencies ?? defaultGetDependencies, test.shouldRevalidate ?? defaultShouldRevalidate]
        
        const asyncStatus: AsyncValidationStatus = {
            dependencies: getDependencies(context),
            getDependencies,
            shouldRevalidate
        }
        const promise = constraint
            .then(message => {
                if (message == null || message === true)
                    asyncStatus.status = undefined
                else {
                    let level: Level | undefined = undefined
                    if (Array.isArray(message)) {
                        const [maybeMessage, maybeLevel] = message
                        message = maybeMessage
                        level = maybeLevel ?? undefined
                    }
                    asyncStatus.status = context.createStatus("test", false, typeof message === "string" ? message : undefined, level ?? "error")
                }
                return asyncStatus.status
            })
            .catch(error => {
                asyncStatus.status = context.createStatus("test", false, error != null ? String(error) : undefined, "unavailable")
                return Promise.resolve(asyncStatus.status)
            })
        
        asyncStatus.status = context.setStatus("test", promise, message, level ?? "pending")
        context.yop.asyncStatuses.set(path, asyncStatus)
        return false
    }

    return context.setStatus("test", false, typeof constraint === "string" ? constraint : message, level ?? "error") == null
}
