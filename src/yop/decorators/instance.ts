import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { TestConstraints, validateTestConstraint } from "../constraints/TestConstraints"
import { Constructor, isObject } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator, validationSymbol, Yop } from "../Yop"
import { InternalTypeConstraints, validateType } from "./type"

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

type CheckValue<Value extends object | null | undefined> = ExcludeFromObject<Value, ExcludedObjects>

export type InstanceValue = object | null | undefined

export interface InstanceConstraints<Value extends InstanceValue, Parent> extends
    CommonConstraints<Value, Parent>,
    TestConstraints<Value, Parent>
{
    of: Constructor<Value> | string
}

function validateInstance<Value extends InstanceValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: InstanceConstraints<Value, Parent>) {
    if (!validateCommonConstraints(context, constraints) ||
        !validateValueType(context, isObject, "object") ||
        !validateTestConstraint(context, constraints) ||
        ((constraints.of as any) = Yop.resolveClass(constraints.of)) == null)
        return false

    const classConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol] as InternalTypeConstraints | undefined
    return classConstraints == null || validateType(context, classConstraints)
}

export function instance<Value extends CheckValue<Value>, Parent>(constraints: InstanceConstraints<Value, Parent>) {
    return fieldValidationDecorator("instance", constraints, validateInstance)
}
