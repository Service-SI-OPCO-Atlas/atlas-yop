import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Metadata"
import { StringValue } from "./string"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { CommonConstraints, validateCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { isString, isStringArray } from "../TypesUtil"
import { OneOfConstraint, validateOneOfConstraint } from "../constraints/OneOfConstraint"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"

export interface TimeConstraints<Value extends StringValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, string, Parent>,
    OneOfConstraint<Value, Parent>,
    TestConstraint<Value, Parent> {
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#time_strings
export const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:\.([0-9]{1,3}))?)?$/

export function timeToMillis(time: string) {
    const matches = timeRegex.exec(time)
    if (matches == null)
        return undefined
    return (
        (+(matches[1]) * 3600 * 1000) +
        (+(matches[2]) * 60 * 1000) +
        (+(matches[3] ?? 0) * 1000) +
        (+(matches[4] ?? 0))
    )
}

const MAX_MILLIS = (24 * 3600 * 1000) - 1

export function validateTime<Value extends StringValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: TimeConstraints<Value, Parent>) {
    if (!validateCommonConstraints(context, constraints))
        return false
    if (context.value == null)
        return true
    if (!validateTypeConstraint(context, isString, "time"))
        return false
    
    const millis = timeToMillis(context.value)
    if (millis == null)
        return context.setStatus("match", timeRegex) == null

    return (
        validateMinMaxConstraints(context, constraints, isString, (_, min) => millis >= (timeToMillis(min) ?? 0), (_, max) => millis <= (timeToMillis(max) ?? MAX_MILLIS)) &&
        validateOneOfConstraint(context, constraints, isStringArray) &&
        validateTestConstraint(context, constraints)
    )
}

export function time<Value extends StringValue, Parent>(constraints?: TimeConstraints<Value, Parent>, groups?: Record<string, TimeConstraints<Value, Parent>>) {
    return fieldValidationDecorator("time", constraints ?? {}, groups, validateTime)
}
