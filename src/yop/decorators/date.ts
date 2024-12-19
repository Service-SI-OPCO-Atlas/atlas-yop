import { CommonConstraints, validateCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { OneOfConstraint, validateOneOfConstraint } from "../constraints/OneOfConstraint"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { isDate, isDateArray } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type DateValue = Date | null | undefined

export interface DateConstraints<Value extends DateValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, Date, Parent>,
    OneOfConstraint<Value, Parent>,
    TestConstraint<Value, Parent> {
}

function validateDate<Value extends DateValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: DateConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateTypeConstraint(context, isDate, "date") &&
        validateMinMaxConstraints(context, constraints, isDate, (value, min) => value >= min, (value, max) => value <= max) &&
        validateOneOfConstraint(context, constraints, isDateArray, (date1, date2) => date1.getTime() === date2.getTime()) &&
        validateTestConstraint(context, constraints)
    )
}

export function date<Value extends DateValue, Parent>(constraints?: DateConstraints<Value, Parent>) {
    return fieldValidationDecorator("date", constraints ?? {}, validateDate)
}
