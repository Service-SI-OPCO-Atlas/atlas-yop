import { ConstraintValue, validateConstraint } from "./Constraint"
import { InternalValidationContext } from "../ValidationContext"

export interface OneOfConstraint<Value, Parent = unknown> {
    oneOf?: ConstraintValue<NonNullable<Value>, NoInfer<NonNullable<Value>>[], Parent>
}

export function validateOneOfConstraint<Value, OneOfType extends NoInfer<NonNullable<Value>>[], Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: OneOfConstraint<Value, Parent>,
    isConstraintValue: (value: any) => value is OneOfType) {
    return validateConstraint(
        context as InternalValidationContext<NonNullable<Value>, Parent>,
        constraints.oneOf,
        isConstraintValue,
        (value, constraint) => constraint.includes(value),
        "oneOf"
    )
}
