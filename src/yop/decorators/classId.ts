import { InternalCommonConstraints, InternalConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { validateConstraint } from "../constraints/Constraint"
import { Constructor, isBoolean, isObject } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { validationSymbol, Yop } from "../Yop"

export interface ClassIdConstraints {
    id?: string
}

export interface InternalClassConstraints extends ClassIdConstraints, InternalConstraints {
    fields?: Record<string, InternalCommonConstraints>
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

export function classId<Type extends object, Class extends Constructor<Type>>(id: string) {
    return function decorateClass(target: Class, context: ClassDecoratorContext<Class>) {
        const classConstraints = initClassConstraints(context.metadata)
        classConstraints.id = id
        Yop.registerClass(id, target)
    }
}
