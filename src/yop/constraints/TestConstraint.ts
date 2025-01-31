import { InternalValidationContext, Level, ValidationStatus } from "../ValidationContext"
import { ConstraintFunction, ConstraintMessage } from "./Constraint"
import { isFunction, isPromise } from "../TypesUtil"
import { AsyncValidationStatus } from "../Yop"
import { joinPath } from "../PathUtil"

export type TestConstraintMessage = ConstraintMessage | readonly [ConstraintMessage, Level] | boolean | undefined

export type ExtendedTestConstraintPromise<Value, Parent = unknown, Dependencies = any> = {
    promise: Promise<TestConstraintMessage>
    getDependencies: (context: InternalValidationContext<Value, Parent>) => Dependencies
    shouldRevalidate: (previous: Dependencies, current: Dependencies, status: ValidationStatus | undefined) => boolean
}

export const extendedPromise = <Dependencies, Value, Parent = unknown>(test: {
    promise: Promise<TestConstraintMessage>,
    getDependencies: (context: InternalValidationContext<Value, Parent>) => Dependencies,
    shouldRevalidate: (previous: Dependencies, current: Dependencies, status: ValidationStatus | undefined) => boolean
}): ExtendedTestConstraintPromise<Value, Parent, Dependencies> => test

const isExtendedPromise = (value: any): value is ExtendedTestConstraintPromise<any> => {
    return isFunction(value.getDependencies) && isFunction(value.shouldRevalidate) && isPromise(value.promise)
}

export type TestConstraintFunction<Value, Parent = unknown> = ConstraintFunction<
    NonNullable<Value>,
    TestConstraintMessage | Promise<TestConstraintMessage> | ExtendedTestConstraintPromise<NonNullable<Value>, Parent>,
    Parent
>

export interface TestConstraint<Value, Parent = unknown> {
    test?: TestConstraintFunction<Value, Parent>
}

const defaultGetDependencies = (context: InternalValidationContext<unknown>) => context.value
const defaultShouldRevalidate = (previous: any, current: any, status: ValidationStatus | undefined) => status?.level !== "unavailable" && previous !== current

export function validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: TestConstraint<Value, Parent>
) {
    if (constraints.test == null || context.options?.skipTests)
        return true
    
    if (context.groups == null)
        return _validateTestConstraint(context, constraints)

    const groups = Array.isArray(context.groups) ? context.groups : [context.groups]
    for (const group of groups) {
        const constraint = (group == null ? constraints.test : (constraints as any).groups?.[group]?.test)
        if (!_validateTestConstraint(context, { test: constraint }))
            return false
    }
    return true
}

function _validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: TestConstraint<Value, Parent>
) {
    const path = joinPath(context.path)
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

    let constraint = constraints.test?.(context as InternalValidationContext<NonNullable<Value>, Parent>)
    let message: any = undefined
    let level: Level | undefined = undefined

    if (Array.isArray(constraint)) {
        const [maybeConstraint, maybeMessage, maybeLevel, _maybeGroup] = constraint
        constraint = maybeConstraint
        message = maybeMessage
        level = maybeLevel ?? undefined
    }
    
    if (constraint == null || constraint === true)
        return true

    if (isPromise(constraint) || isExtendedPromise(constraint)) {
        const [testPromise, getDependencies, shouldRevalidate] = isExtendedPromise(constraint) ?
            [constraint.promise, constraint.getDependencies, constraint.shouldRevalidate] :
            [constraint, defaultGetDependencies, defaultShouldRevalidate]
        
        const asyncStatus: AsyncValidationStatus = {
            dependencies: getDependencies(context),
            getDependencies,
            shouldRevalidate
        }
        const promise = testPromise
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
