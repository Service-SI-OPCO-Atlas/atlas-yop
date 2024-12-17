import { Constraint, validateConstraint } from "./Constraint"
import { ValidationContext } from "../ValidationContext"

export interface MinMaxConstraints<Value, MinMax, Parent = unknown> {
    min?: Constraint<NonNullable<Value>, MinMax, Parent>
    max?: Constraint<NonNullable<Value>, MinMax, Parent>
}

export enum MinMaxCodes {
    min = "min",
    max = "max",
}

export function validateMinConstraint<Value, Min, Parent>(
    context: ValidationContext<Value, Parent>,
    constraints: MinMaxConstraints<NonNullable<Value>, Min, Parent>,
    isConstraintValue: (value: any) => value is Min,
    validate: (value: NonNullable<Value>, min: NonNullable<Min>) => boolean) {
    return validateConstraint(context as ValidationContext<NonNullable<Value>, Parent>, constraints.min, isConstraintValue, validate, MinMaxCodes.min)
}

export function validateMaxConstraint<ValueType, Max, Parent>(
    context: ValidationContext<ValueType, Parent>,
    constraints: MinMaxConstraints<NonNullable<ValueType>, Max, Parent>,
    isConstraintValue: (value: any) => value is Max,
    validate: (value: NonNullable<ValueType>, max: NonNullable<Max>) => boolean) {
    return validateConstraint(context as ValidationContext<NonNullable<ValueType>, Parent>, constraints.max, isConstraintValue, validate, MinMaxCodes.max)
}
