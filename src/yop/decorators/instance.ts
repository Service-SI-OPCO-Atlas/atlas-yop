import { CommonConstraints, InternalCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { InternalClassConstraints, validateClass } from "../Metadata"
import { Constructor, isObject } from "../TypesUtil"
import { InternalValidationContext } from "../ValidationContext"
import { validationSymbol, Yop } from "../Yop"
import { fieldValidationDecorator } from "../Metadata"

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

export type CheckClass<Value extends object | null | undefined> = ExcludeFromObject<Value, ExcludedObjects>

export type InstanceValue = object | null | undefined

export interface InstanceConstraints<Value extends InstanceValue, Parent> extends
    CommonConstraints<Value, Parent>,
    TestConstraint<Value, Parent> {
    of: Constructor<Value> | string
}

function traverseInstance<Value extends InstanceValue, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: InstanceConstraints<Value, Parent>,
    key: string | number,
    traverseNullish?: boolean
): readonly [InternalCommonConstraints | undefined, any] {
    if (((constraints.of as any) = Yop.resolveClass(constraints.of)) == null)
        return [undefined, undefined] as const
    const classConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol] as InternalClassConstraints | undefined
    if (classConstraints == null)
        return [undefined, undefined] as const
    return classConstraints.traverse!(context as InternalValidationContext<never, never>, classConstraints, key, traverseNullish)
}

function validateInstance<Value extends InstanceValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: InstanceConstraints<Value, Parent>) {
    if (!validateTypeConstraint(context, isObject, "object") ||
        !validateTestConstraint(context, constraints) ||
        ((constraints.of as any) = Yop.resolveClass(constraints.of)) == null)
        return false

    const classConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol] as InternalClassConstraints | undefined
    return classConstraints == null || validateClass(context as InternalValidationContext<Record<string, any>>, classConstraints)
}

export function instance<Value extends CheckClass<Value>, Parent>(constraints?: InstanceConstraints<Value, Parent>, groups?: Record<string, InstanceConstraints<Value, Parent>>) {
    return fieldValidationDecorator("instance", constraints ?? {} as InstanceConstraints<Value, Parent>, groups, validateInstance, undefined, traverseInstance)
}
