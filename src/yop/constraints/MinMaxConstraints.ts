import { Constraint, validateConstraint } from "./Constraint"
import { InternalValidationContext } from "../ValidationContext"

export interface MinMaxConstraints<Value, MinMax, Parent = unknown> {
    min?: Constraint<NonNullable<Value>, MinMax, Parent>
    max?: Constraint<NonNullable<Value>, MinMax, Parent>
}

export enum MinMaxCodes {
    min = "min",
    max = "max",
}

export function validateMinConstraint<Value, Min, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: MinMaxConstraints<NonNullable<Value>, Min, Parent>,
    isConstraintValue: (value: any) => value is Min,
    validate: (value: NonNullable<Value>, min: NonNullable<Min>) => boolean) {
    return validateConstraint(context as InternalValidationContext<NonNullable<Value>, Parent>, constraints.min, isConstraintValue, validate, MinMaxCodes.min)
}

export function validateMaxConstraint<Value, Max, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: MinMaxConstraints<NonNullable<Value>, Max, Parent>,
    isConstraintValue: (value: any) => value is Max,
    validate: (value: NonNullable<Value>, max: NonNullable<Max>) => boolean) {
    return validateConstraint(context as InternalValidationContext<NonNullable<Value>, Parent>, constraints.max, isConstraintValue, validate, MinMaxCodes.max)
}
