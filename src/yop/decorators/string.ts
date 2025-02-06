import { CommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { Constraint, Message, validateConstraint } from "../constraints/Constraint"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { OneOfConstraint, validateOneOfConstraint } from "../constraints/OneOfConstraint"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { isNumber, isRegExp, isString, isStringArray } from "../TypesUtil"
import { InternalValidationContext, ValuedContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Metadata"

export type StringValue = string | null | undefined

export interface StringConstraints<Value extends StringValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    OneOfConstraint<Value, Parent>,
    TestConstraint<Value, Parent> {
    match?: Constraint<NonNullable<Value>, RegExp, Parent>
}

export function validateString<Value extends StringValue, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: StringConstraints<Value, Parent>,
    defaultRegexp?: RegExp,
    defaultMatchMessage?: Message<Value, Parent>,
    type?: string
) {
    return (
        validateTypeConstraint(context, isString, type ?? "string") &&
        validateMinMaxConstraints(context, constraints, isNumber, (value, min) => value.length >= min, (value, max) => value.length <= max) &&
        validateConstraint(context as ValuedContext<Value, Parent>, constraints, "match", isRegExp, (value, re) => re.test(value), defaultRegexp, defaultMatchMessage) &&
        validateOneOfConstraint(context, constraints, isStringArray) &&
        validateTestConstraint(context, constraints)
    )
}

export function string<Value extends StringValue, Parent>(constraints?: StringConstraints<Value, Parent>, groups?: Record<string, StringConstraints<Value, Parent>>) {
    return fieldValidationDecorator("string", constraints ?? {}, groups, validateString, isNumber)
}
