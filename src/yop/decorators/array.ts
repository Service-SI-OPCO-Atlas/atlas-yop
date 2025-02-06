import { CommonConstraints, InternalCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { InternalClassConstraints } from "../Metadata"
import { ArrayElementType, Constructor, isNumber } from "../TypesUtil"
import { InternalValidationContext } from "../ValidationContext"
import { validationSymbol, Yop } from "../Yop"
import { fieldValidationDecorator } from "../Metadata"

export type ArrayValue = any[] | null | undefined

export interface ArrayConstraints<Value extends ArrayValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    TestConstraint<Value, Parent> {
    of: (
        Constructor<ArrayElementType<Value>> |
        string |
        ((_: any, context: ClassFieldDecoratorContext<Value, ArrayElementType<Value>>) => void)
    )
}

function resolveOf<Value extends ArrayValue, Parent>(constraints: ArrayConstraints<Value, Parent>) {
    let of: any = Yop.resolveClass(constraints.of)
    if (of?.[Symbol.metadata] == null && typeof of === "function") {
        const metadata = { [validationSymbol]: {} as InternalClassConstraints }
        of(null, { metadata, name: "of" })
        of = { [Symbol.metadata]: { [validationSymbol]: metadata[validationSymbol]!.fields!.of }}
    }
    return (constraints.of as any) = of
}

function traverseArray<Value extends ArrayValue, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: ArrayConstraints<Value, Parent>,
    propertyOrIndex: string | number,
    traverseNullish?: boolean
): readonly [InternalCommonConstraints | undefined, any] {
    if (traverseNullish ? context.value != null && (!Array.isArray(context.value) || typeof propertyOrIndex !== "number") : context.value == null)
        return [undefined, undefined]
    const of = resolveOf(constraints)
    const elementConstraints = of?.[Symbol.metadata]?.[validationSymbol]
    return [elementConstraints, context.value?.[propertyOrIndex as number]]
}

function validateArray<Value extends ArrayValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: ArrayConstraints<Value, Parent>) {
    if (!validateTypeConstraint(context, Array.isArray, "array") ||
        !validateMinMaxConstraints(context, constraints, isNumber, (value, min) => value.length >= min, (value, max) => value.length <= max) ||
        resolveOf(constraints) == null)
        return false

    let valid = true
    
    const elementConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol] as InternalCommonConstraints | undefined
    if (elementConstraints != null) {
        for (const [index, element] of context.value!.entries()) {
            const elementContext = context.createChildContext({
                kind: elementConstraints.kind,
                value: element,
                key: index,
            })
            valid = elementConstraints.validate(elementContext, elementConstraints) && valid
        }    
    }
    
    return valid && validateTestConstraint(context, constraints)
}

export function array<Value extends ArrayValue, Parent>(constraints?: ArrayConstraints<Value, Parent>, groups?: Record<string, ArrayConstraints<Value, Parent>>) {
    return fieldValidationDecorator("array", constraints ?? ({} as ArrayConstraints<Value, Parent>), groups, validateArray, isNumber, traverseArray)
}

