import { Constraint, validateConstraint } from "./Constraint"
import { InternalValidationContext, ValuedContext } from "../ValidationContext"

export interface MinMaxConstraints<Value, MinMax, Parent = unknown> {
    min?: Constraint<NonNullable<Value>, MinMax, Parent>
    max?: Constraint<NonNullable<Value>, MinMax, Parent>
    isMinMaxType?: (value: any) => value is MinMax
}

export function validateMinMaxConstraints<Value, MinMax, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: MinMaxConstraints<Value, MinMax, Parent>,
    isConstraintValue: (value: any) => value is MinMax,
    validateMin: (value: NonNullable<Value>, min: NonNullable<MinMax>) => boolean,
    validateMax: (value: NonNullable<Value>, max: NonNullable<MinMax>) => boolean) {
    return (
        validateConstraint(context as ValuedContext<Value, Parent>, constraints, "min", isConstraintValue, validateMin) &&
        validateConstraint(context as ValuedContext<Value, Parent>, constraints, "max", isConstraintValue, validateMax)
    )
}
