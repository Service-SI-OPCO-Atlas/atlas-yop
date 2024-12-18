import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { ArrayElementType, Constructor, isNumber } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator, validationSymbol, Yop } from "../Yop"
import { InternalTypeConstraints } from "./type"

type ArrayValue = any[] | null | undefined

interface ArrayConstraints<Value extends ArrayValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, number, Parent> {
    of: (
        Constructor<ArrayElementType<Value>> |
        string |
        ((_: any, context: ClassFieldDecoratorContext<Value, ArrayElementType<Value>>) => void)
    )
}

function resolveOf<Value extends ArrayValue, Parent>(constraints: ArrayConstraints<Value, Parent>) {
    let of: any = Yop.resolveClass(constraints.of)
    if (of?.[Symbol.metadata] == null && typeof of === "function") {
        const metadata = { [validationSymbol]: {} as InternalTypeConstraints }
        of(null, { metadata, name: "of" });
        of = { [Symbol.metadata]: { [validationSymbol]: metadata[validationSymbol]!.fields!.of }}
    }
    return (constraints.of as any) = of
}

function traverseArray<Value extends ArrayValue, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraints: ArrayConstraints<Value, Parent>,
    propertyOrIndex: string | number
): [InternalTypeConstraints | undefined, any] {
    if (!Array.isArray(context.value) || typeof propertyOrIndex !== "number")
        return [undefined, undefined]
    const of = resolveOf(constraints)
    const elementConstraints = of?.[Symbol.metadata]?.[validationSymbol]
    return [elementConstraints, context.value?.[propertyOrIndex]]
}

function validateArray<Value extends ArrayValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: ArrayConstraints<Value, Parent>) {
    if (!validateCommonConstraints(context, constraints) ||
        !validateValueType(context, Array.isArray, "array") ||
        !validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.length >= constraint) ||
        !validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.length <= constraint) ||
        resolveOf(constraints) == null)
        return

    const elementConstraints = (constraints.of as any)[Symbol.metadata]?.[validationSymbol]
    if (elementConstraints == null)
        return

    for (const [index, element] of context.value!.entries()) {
        const elementContext = context.createChildContext({
            kind: elementConstraints.kind,
            value: element,
            propertyOrIndex: index,
        })
        elementConstraints.validate(elementContext, elementConstraints)
    }
}

export function array<Value extends ArrayValue, Parent>(constraints: ArrayConstraints<Value, Parent>) {
    return fieldValidationDecorator("array", constraints, validateArray, traverseArray)
}

