import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { ArrayElementType, Constructor, isNumber } from "../types"
import { ValidationContext } from "../ValidationContext"
import { fieldValidationDecorator, validationSymbol, Yop } from "../Yop"
import { InternalTypeConstraints } from "./type"

type ArrayValue = any[] | null | undefined

interface ArrayConstraints<Value extends ArrayValue, Parent> extends CommonConstraints<Value, Parent>, MinMaxConstraints<Value, number, Parent> {
    readonly of: (
        Constructor<ArrayElementType<Value>> |
        string |
        ((_: any, context: ClassFieldDecoratorContext<Value, ArrayElementType<Value>>) => void)
    )
}

function validateArray<Value extends ArrayValue, Parent>(context: ValidationContext<Value, Parent>, constraints: ArrayConstraints<Value, Parent>) {
    if (!validateCommonConstraints(context, constraints) ||
        !validateValueType(context, Array.isArray, "array") ||
        !validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.length >= constraint) ||
        !validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.length <= constraint) ||
        ((constraints.of as any) = Yop.resolveClass(constraints.of)) == null)
        return

    let of: any = constraints.of
    if (of[Symbol.metadata] == null && typeof of === "function") {
        const metadata = { [validationSymbol]: {} as InternalTypeConstraints }
        of(null, { metadata, name: "of" })
        of = (constraints.of as any) = { [Symbol.metadata]: { [validationSymbol]: metadata[validationSymbol]!.fields!.of }}
        if (of == null)
            return
    }

    const elementConstraints = of[Symbol.metadata]?.[validationSymbol]
    if (elementConstraints == null)
        return

    for (const [index, element] of context.value!.entries()) {
        const elementContext = context.createChildContext({
            kind: elementConstraints.kind,
            value: element,
            path: `${ context.path }[${ index }]`,
        })
        elementConstraints.validate(elementContext, elementConstraints)
    }
}

export function array<Value extends ArrayValue, Parent>(constraints: ArrayConstraints<Value, Parent>) {
    return fieldValidationDecorator("array", constraints, validateArray)
}

