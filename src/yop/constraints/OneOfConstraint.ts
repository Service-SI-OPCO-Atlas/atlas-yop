import { Constraint, validateConstraint } from "./Constraint"
import { InternalValidationContext, ValuedContext } from "../ValidationContext"

export interface OneOfConstraint<Value, Parent = unknown> {
    oneOf?: Constraint<NonNullable<Value>, NoInfer<NonNullable<Value>>[], Parent>
}

export function validateOneOfConstraint<Value, OneOfType extends NoInfer<NonNullable<Value>>[], Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: OneOfConstraint<Value, Parent>,
    isConstraintValue: (value: any) => value is OneOfType,
    equals?: (value1: NonNullable<Value>, value2: NonNullable<Value>) => boolean
) {
    return validateConstraint(
        context as ValuedContext<Value, Parent>,
        constraints,
        "oneOf",
        isConstraintValue,
        (value, array) => equals == null ? array.includes(value) : array.some((item) => equals(value, item))
    )
}
