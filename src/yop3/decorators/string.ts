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

// /////////////////////////////
// // time decorator
// /////////////////////////////

// interface TimeConstraints<Field extends StringType, Parent> extends StringCommonConstraints<Field, Parent, string> {
// }

// const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/

// function parseTime(time: string | null | undefined): number {
//     if (time == null)
//         return NaN
//     const matched = time.match(timeRegex)
//     if (matched == null)
//         return NaN
//     const hours = parseInt(matched[1])
//     if (hours > 23)
//         return NaN
//     const minutes = parseInt(matched[2])
//     if (minutes > 59)
//         return NaN
//     const seconds = matched[3] != null ? parseInt(matched[3].substring(1)) : 0
//     if (seconds > 59)
//         return NaN
//     return (hours * 3600) + (minutes * 60) + seconds
// }

// // function formatTime(time: number | null | undefined, modulo24h = true): string {
// //     function formatNumber(value: number) {
// //         return value.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false })
// //     }
    
// //     if (time == null || time < 0)
// //         return ""

// //     const hours = modulo24h ? Math.trunc(time / 3600) % 24 : Math.trunc(time / 3600)
// //     const minutes = Math.trunc((time % 3600) / 60)
// //     const seconds = time % 60
    
// //     if (seconds > 0)
// //         return `${ formatNumber(hours) }:${ formatNumber(minutes) }:${ formatNumber(seconds) }`
// //     return `${ formatNumber(hours) }:${ formatNumber(minutes) }`
// // }

// function validateTime(this: TimeConstraints<StringType, unknown>, context: ValidationContext<StringType, unknown>) {
//     const errors = validateStringCommonConstraints.bind(this)(context)
//     if (errors.length > 0)
//         return errors

//     const value = context.value
//     if (value != null) {
//         // if (!timeRegex.test(value))
//         //     return ["Time match"]
//         let parsedTime = null
//         const min = parseTime(resolveConstraint(context as ValidationContext<string, unknown>, this.min))
//         if (min != null && (parsedTime ??= parseTime(value)) < min)
//             return ["Min"]
//         const max = parseTime(resolveConstraint(context as ValidationContext<string, unknown>, this.max))
//         if (max != null && (parsedTime ??= parseTime(value)) > max)
//             return ["Max"]
//     }

//     return []
// }

// export function time<Field extends StringType, Parent>(constraints?: TimeConstraints<Field, Parent>) {
//     return fieldMetadataDecorator("time", constraints)
// }
