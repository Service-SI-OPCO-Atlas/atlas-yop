import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { Constructor, isObject } from "../types"
import { ValidationContext } from "../ValidationContext"
import { fieldValidationDecorator, validationSymbol, Yop } from "../Yop"
import { validateType } from "./type"

type ExcludeFromObject<T extends object | null | undefined, U extends object, M = { [K in keyof T]: T[K] }> =
    M extends object ?
    M extends U ?
        never :
        M | null | undefined :
    never

type ExcludedObjects =
    String |
    Boolean |
    Number |
    Date |
    File |
    BigInt |
    RegExp |
    Error |
    Array<any> |
    Set<any> |
    Map<any, any>

type InstanceValue = object | null | undefined

type CheckValue<Value extends object | null | undefined> = ExcludeFromObject<Value, ExcludedObjects>

interface InstanceConstraints<Value extends InstanceValue, Parent> extends CommonConstraints<Value, Parent> {
    readonly of: Constructor<Value> | string
}

// function constraintsAt(yop: Yop, constraints: InstanceConstraints<any, any, any>, pathSegment: string) {
//     let of = constraints.of
//     if (typeof of === 'string')
//         of = yop.getClass(of)
//     return of[Symbol.metadata]?.[validationSymbol]?.[pathSegment] as (CommonConstraints<unknown, unknown> & Kind) | undefined
// }

function validateInstance<Value extends InstanceValue, Parent>(context: ValidationContext<Value, Parent>, constraints: InstanceConstraints<Value, Parent>) {
    if (!validateCommonConstraints(context, constraints) ||
        !validateValueType(context, isObject, "object") ||
        ((constraints.of as any) = Yop.getClass(constraints.of)) == null)
        return

    const classConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol]
    validateType(context, classConstraints)
}

export function instance<Value extends CheckValue<Value>, Parent>(constraints: InstanceConstraints<Value, Parent>) {
    return fieldValidationDecorator("instance", constraints, validateInstance)
}
