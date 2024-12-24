import { isPromise } from "util/types"
import { InternalValidationContext, Level } from "../ValidationContext"
import { ConstraintFunction, ConstraintMessage } from "./Constraint"
import { isFunction } from "../TypesUtil"

export type TestConstraintMessage = ConstraintMessage | boolean | undefined

export interface TestConstraint<Value, Parent = unknown> {
    test?: ConstraintFunction<NonNullable<Value>, TestConstraintMessage | Promise<TestConstraintMessage>, Parent>
}

export function validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: TestConstraint<Value, Parent>
) {
    let constraint = constraints.test?.(context as InternalValidationContext<NonNullable<Value>, Parent>)
    let message: any = undefined
    let level: Level | undefined  = undefined

    if (Array.isArray(constraint)) {
        const [maybeConstraint, maybeMessage, maybeLevel, _maybeGroup] = constraint
        constraint = maybeConstraint
        message = maybeMessage
        level = (maybeLevel as unknown as Level) ?? undefined
    }

    if (constraint == null || constraint === true)
        return true
    
    if (isFunction(constraint))
        constraint = constraint()
    if (isFunction(message))
        message = message()

    if (isPromise(constraint))
        return context.createStatus("test", constraint, message, level ?? "info")
    return context.createStatus("test", false, typeof constraint === "string" ? constraint : message, level ?? "error")
}
