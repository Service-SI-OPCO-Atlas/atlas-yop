import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { Constraint, validateConstraint } from "../constraints/Constraint"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { TestConstraints, validateTestConstraint } from "../constraints/TestConstraints"
import { isNumber, isRegExp, isString, isStringArray } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type StringValue = string | null | undefined

export interface StringConstraints<Value extends StringValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    TestConstraints<Value, Parent>
{
    match?: Constraint<NonNullable<Value>, RegExp, Parent>
    oneOf?: Constraint<NonNullable<Value>, NoInfer<NonNullable<Value>>[], Parent>
}


export function validateString<Value extends StringValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: StringConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateValueType(context, isString, "string") &&
        validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.length >= constraint) &&
        validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.length <= constraint) &&
        validateConstraint(context, constraints.match, isRegExp, (value, constraint) => constraint.test(value), "match") &&
        validateConstraint(context, constraints.oneOf, isStringArray, (value, constraint) => constraint.includes(value), "oneOf") &&
        validateTestConstraint(context, constraints)
    )
}

export function string<Value extends StringValue, Parent>(constraints: StringConstraints<Value, Parent>) {
    return fieldValidationDecorator("string", constraints, validateString)
}
