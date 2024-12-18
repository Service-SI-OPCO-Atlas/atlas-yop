import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { isDate } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

type DateValue = Date | null | undefined

interface DateConstraints<Value extends DateValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, Date, Parent> {}

function validateDate<Value extends DateValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: DateConstraints<Value, Parent>) {
    validateCommonConstraints(context, constraints) &&
    validateValueType(context, isDate, "date") &&
    validateMinConstraint(context, constraints, isDate, (value, constraint) => value >= constraint) &&
    validateMaxConstraint(context, constraints, isDate, (value, constraint) => value <= constraint)
}

export function date<Value extends DateValue, Parent>(constraints: DateConstraints<Value, Parent>) {
    return fieldValidationDecorator("date", constraints, validateDate)
}
