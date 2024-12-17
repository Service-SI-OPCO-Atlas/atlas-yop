import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { isNumber } from "../types"
import { ValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type NumberValue = number | null | undefined

interface NumberConstraints<Value extends NumberValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, number, Parent> {}

function validateNumber<Value extends NumberValue, Parent>(context: ValidationContext<Value, Parent>, constraints: NumberConstraints<Value, Parent>) {
    validateCommonConstraints(context, constraints) &&
    validateValueType(context, isNumber, "number") &&
    validateMinConstraint(context, constraints, isNumber, (value, constraint) => value >= constraint) &&
    validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value <= constraint)
}

export function number<Value extends NumberValue, Parent>(constraints: NumberConstraints<Value, Parent>) {
    return fieldValidationDecorator("number", constraints, validateNumber)
}
