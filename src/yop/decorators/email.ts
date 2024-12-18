import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { Constraint, validateConstraint } from "../constraints/Constraint"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { isNumber, isRegExp, isString } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type EmailValue = string | null | undefined

export interface EmailConstraints<Value extends EmailValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, number, Parent> {
    readonly match?: Constraint<NonNullable<Value>, RegExp | undefined, Parent>
}

const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i


function validateEmail<Value extends EmailValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: EmailConstraints<Value, Parent>) {
    validateCommonConstraints(context, constraints) &&
    validateValueType(context, isString, "email") &&
    validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.length >= constraint) &&
    validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.length <= constraint) &&
    validateConstraint(context, constraints.match, isRegExp, (value, constraint) => constraint.test(value), "match", emailRegex)
}

export function email<Value extends EmailValue, Parent>(constraints: EmailConstraints<Value, Parent>) {
    return fieldValidationDecorator("email", constraints, validateEmail)
}
