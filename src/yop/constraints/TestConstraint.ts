import { InternalValidationContext, Level } from "../ValidationContext"
import { ConstraintFunction, ConstraintMessage } from "./Constraint"

export interface TestConstraint<Value, Parent = unknown> {
    test?: ConstraintFunction<NonNullable<Value>, ConstraintMessage, Parent>
}

export function validateTestConstraint<Value, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: TestConstraint<Value, Parent>
) {
    let constraint = constraints.test?.(context as InternalValidationContext<NonNullable<Value>, Parent>)
    let message: ConstraintMessage = undefined
    let level: Level = "error"

    if (Array.isArray(constraint)) {
        const [maybeConstraint, maybeMessage, maybeLevel, _maybeGroup] = constraint
        constraint = maybeConstraint
        message = maybeMessage
        level = (maybeLevel as unknown as Level) ?? "error"
    }

    if (constraint == null || constraint === true)
        return true
    return context.createStatus("test", false, constraint === false ? message : constraint, level)
}
