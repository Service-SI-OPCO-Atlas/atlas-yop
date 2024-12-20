import { InternalConstraints, InternalCommonConstraints, validateTypeConstraint, ContraintsParent, ContraintsValue, Traverser, Validator } from "./constraints/CommonConstraints"
import { validateConstraint } from "./constraints/Constraint"
import { isBoolean, isObject } from "./types"
import { InternalValidationContext } from "./ValidationContext"
import { validationSymbol } from "./Yop"

export interface InternalClassConstraints extends InternalConstraints {
    fields?: Record<string, InternalCommonConstraints>
}

function traverseClass(context: InternalValidationContext<unknown>, constraints: InternalClassConstraints, key: string | number)
    : readonly [InternalCommonConstraints | undefined, any] {
    if (context.value == null || typeof context.value !== "object" || typeof key !== "string")
        return [undefined, undefined]
    return [constraints.fields?.[key], (context.value as Record<string, any>)[key]]
}

export function validateClass(context: InternalValidationContext<unknown>, constraints: InternalClassConstraints) {
    if (!validateTypeConstraint(context, isObject, "object"))
        return false
    
    const parent = context.value as Record<string, any>
    let valid = true
    for (const [fieldName, fieldConstraints] of Object.entries(constraints.fields!)) {
        const fieldContext = context.createChildContext({
            kind: fieldConstraints.kind,
            value: parent[fieldName],
            key: fieldName,
        })
        
        valid = (
            validateConstraint(fieldContext, fieldConstraints.exists, isBoolean, (_, constraint) => constraint !== true || fieldName in parent, "exists") &&
            fieldConstraints.validate(fieldContext, fieldConstraints) &&
            valid
        )
    }
    return valid
}

export function initClassConstraints(decoratorMetadata: DecoratorMetadata) {
    const metadata = decoratorMetadata as unknown as { [validationSymbol]: InternalClassConstraints }    
    if (!Object.hasOwnProperty.bind(metadata)(validationSymbol))
        metadata[validationSymbol] = { ...metadata[validationSymbol], fields: { ...metadata[validationSymbol]?.fields ?? {} }}
    
    const validation = metadata[validationSymbol]
    validation.validate ??= validateClass
    validation.traverse ??= traverseClass
    validation.kind ??= "class"
    return validation
}

export function fieldValidationDecorator<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>>(
    kind: string,
    constraints: Constraints,
    validate: Validator<Constraints>,
    traverse?: Traverser<Constraints>
) {
    return function decorateClassField(_: any, context: ClassFieldDecoratorContext<Parent, Value>) {
        const classConstraints = initClassConstraints(context.metadata)
        if (!Object.hasOwnProperty.bind(classConstraints)("fields"))
            classConstraints.fields = { ...classConstraints.fields }

        const fieldName = context.name as string
        const fields = classConstraints.fields!
        if (!Object.hasOwnProperty.bind(fields)(fieldName))
            fields[fieldName] = {} as InternalCommonConstraints

        Object.assign(fields[fieldName], { ...constraints, kind, validate, traverse })
    }
}

