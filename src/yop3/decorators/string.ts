import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { Constraint, validateConstraint } from "../constraints/Constraint"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { isNumber, isRegExp, isString, isStringArray } from "../types"
import { ValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

type StringValue = string | null | undefined

interface StringConstraints<Value extends StringValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, number, Parent> {
    match?: Constraint<NonNullable<Value>, RegExp, Parent>
    oneOf?: Constraint<NonNullable<Value>, NoInfer<NonNullable<Value>>[], Parent>
}


function validateString<Value extends StringValue, Parent>(context: ValidationContext<Value, Parent>, constraints: StringConstraints<Value, Parent>) {
    validateCommonConstraints(context, constraints) &&
    validateValueType(context, isString, "string") &&
    validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.length >= constraint) &&
    validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.length <= constraint) &&
    validateConstraint(context, constraints.match, isRegExp, (value, constraint) => constraint.test(value), "match") &&
    validateConstraint(context, constraints.oneOf, isStringArray, (value, constraint) => constraint.includes(value), "oneOf")
}

export function string<Value extends StringValue, Parent>(constraints: StringConstraints<Value, Parent>) {
    return fieldValidationDecorator("string", constraints, validateString)
}
