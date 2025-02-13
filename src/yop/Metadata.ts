import { InternalConstraints, InternalCommonConstraints, ContraintsParent, ContraintsValue, Traverser, Validator, validateCommonConstraints, validateTypeConstraint, CommonConstraints } from "./constraints/CommonConstraints"
import { validateConstraint } from "./constraints/Constraint"
import { TestConstraintFunction, validateTestConstraint } from "./constraints/TestConstraint"
import { isBoolean, isObject } from "./TypesUtil"
import { InternalValidationContext } from "./ValidationContext"
import { validationSymbol } from "./Yop"

export interface InternalClassConstraints<Class = any> extends InternalConstraints {
    test?: TestConstraintFunction<Class>
    fields?: Record<string, InternalCommonConstraints>
}

export function traverseClass(
    context: InternalValidationContext<unknown>,
    constraints: InternalClassConstraints,
    key: string | number,
    traverseNullish?: boolean
): readonly [InternalCommonConstraints | undefined, any] {
    if (traverseNullish ? context.value != null && (typeof context.value !== "object" || typeof key !== "string") : context.value == null)
        return [undefined, undefined]
    return [constraints.fields?.[key], (context.value as Record<string, any>)?.[key]]
}

export function validateClass(context: InternalValidationContext<Record<string, any>>, constraints: InternalClassConstraints) {
    if (context.value == null || !validateTypeConstraint(context, isObject, "object"))
        return false
    
    let valid = true

    const parent = context.value
    for (const [fieldName, fieldConstraints] of Object.entries(constraints.fields!)) {
        const fieldContext = context.createChildContext({
            kind: fieldConstraints.kind,
            value: parent[fieldName],
            key: fieldName,
        })
        
        valid = (
            validateConstraint(fieldContext, fieldConstraints, "exists", isBoolean, (_, constraint) => constraint !== true || fieldName in parent) &&
            fieldConstraints.validate(fieldContext, fieldConstraints) &&
            valid
        )
    }

    return valid && validateTestConstraint(context, constraints)
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

export type ClassFieldDecorator<Value, Parent = unknown> = (_: unknown, context: ClassFieldDecoratorContext<Parent, Value>) => void

export function fieldValidationDecorator<
    Constraints extends CommonConstraints<any, any>,
    Value = ContraintsValue<Constraints>,
    Parent = ContraintsParent<Constraints>
>(
    kind: string,
    constraints: Constraints,
    groups: Record<string, Constraints> | undefined,
    validator: Validator<Constraints>,
    isMinMaxType?: (value: any) => boolean,
    traverse?: Traverser<Constraints>,
) {
    return function decorateClassField(_: unknown, context: ClassFieldDecoratorContext<Parent, Value | null | undefined>) {
        const classConstraints = initClassConstraints(context.metadata)
        if (!Object.hasOwnProperty.bind(classConstraints)("fields"))
            classConstraints.fields = { ...classConstraints.fields }

        const fieldName = context.name as string
        const fields = classConstraints.fields!
        if (!Object.hasOwnProperty.bind(fields)(fieldName))
            fields[fieldName] = {} as InternalCommonConstraints

        const validate = (context: InternalValidationContext<any, any>, constraints: Constraints) =>  {
            if (context.ignored())
                return true
            if (!validateCommonConstraints(context, constraints))
                return false
            if (context.value == null)
                return true
            return validator(context, constraints)
        }

        Object.assign(fields[fieldName], { ...constraints, groups, kind, validate, traverse, isMinMaxType })
    }
}

