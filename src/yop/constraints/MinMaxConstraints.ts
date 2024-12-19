import { ConstraintValue, validateConstraint } from "./Constraint"
import { InternalValidationContext } from "../ValidationContext"

export interface MinMaxConstraints<Value, MinMax, Parent = unknown> {
    min?: ConstraintValue<NonNullable<Value>, MinMax, Parent>
    max?: ConstraintValue<NonNullable<Value>, MinMax, Parent>
}

export function validateMinMaxConstraints<Value, MinMax, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: MinMaxConstraints<NonNullable<Value>, MinMax, Parent>,
    isConstraintValue: (value: any) => value is MinMax,
    validateMin: (value: NonNullable<Value>, min: NonNullable<MinMax>) => boolean,
    validateMax: (value: NonNullable<Value>, max: NonNullable<MinMax>) => boolean) {
    return (
        validateConstraint(context as InternalValidationContext<NonNullable<Value>, Parent>, constraints.min, isConstraintValue, validateMin, "min") &&
        validateConstraint(context as InternalValidationContext<NonNullable<Value>, Parent>, constraints.max, isConstraintValue, validateMax, "max")
    )
}
