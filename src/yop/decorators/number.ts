import { CommonConstraints, validateCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { OneOfConstraint, validateOneOfConstraint } from "../constraints/OneOfConstraint"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { isNumber, isNumberArray } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type NumberValue = number | null | undefined

export interface NumberConstraints<Value extends NumberValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    OneOfConstraint<Value, Parent>,
    TestConstraint<Value, Parent> {
}

function validateNumber<Value extends NumberValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: NumberConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateTypeConstraint(context, isNumber, "number") &&
        validateMinMaxConstraints(context, constraints, isNumber, (value, min) => value >= min, (value, max) => value <= max) &&
        validateOneOfConstraint(context, constraints, isNumberArray) &&
        validateTestConstraint(context, constraints)
    )
}

export function number<Value extends NumberValue, Parent>(constraints: NumberConstraints<Value, Parent>) {
    return fieldValidationDecorator("number", constraints, validateNumber)
}
