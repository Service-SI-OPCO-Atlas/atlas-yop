import { CommonCodes, CommonConstraints } from "../constraints/CommonConstraints"
import { validateConstraint } from "../constraints/Constraint"
import { Constructor, isBoolean } from "../types"
import { ValidationContext } from "../ValidationContext"
import { InternalCommonConstraints, validationSymbol, Yop } from "../Yop"

export interface TypeConstraints extends CommonConstraints<unknown> {
    id?: string
}

export interface InternalTypeConstraints extends TypeConstraints, InternalCommonConstraints {
    fields?: Record<string, InternalCommonConstraints>
}

export function initTypeConstraints(decoratorMetadata: DecoratorMetadata) {
    const metadata = decoratorMetadata as unknown as { [validationSymbol]: InternalTypeConstraints }
    
    if (!Object.hasOwnProperty.bind(metadata)(validationSymbol))
        metadata[validationSymbol] = { ...metadata[validationSymbol] }
    
    const validation = metadata[validationSymbol]
    validation.validate ??= validateType
    validation.kind ??= "class"
    return validation
}

export function validateType<Value, Parent>(context: ValidationContext<Value, Parent>, constraints: InternalTypeConstraints) {
    const parent = context.value as Record<string, any>
    const parentPath = context.path
    for (const [fieldName, fieldConstraints] of Object.entries(constraints.fields!)) {
        const fieldContext = context.createChildContext({
            kind: fieldConstraints.kind,
            value: parent[fieldName],
            path: parentPath ? `${ parentPath }.${ fieldName }` : fieldName,
        })
        
        validateConstraint(fieldContext, fieldConstraints.exists, isBoolean, (_, constraint) => constraint !== true || fieldName in parent, CommonCodes.exists) &&
        fieldConstraints.validate(fieldContext, fieldConstraints)
    }
}

export function type<Type extends object, Class extends Constructor<Type>>(constraints: TypeConstraints) {
    return function decorateClass(target: Class, context: ClassDecoratorContext<Class>) {
        const { id, exists, defined, notnull, required, ...fields } = constraints
        
        const classConstraints = initTypeConstraints(context.metadata)
        classConstraints.id = id
        classConstraints.exists = exists ?? classConstraints.exists
        classConstraints.required = required ?? classConstraints.required
        classConstraints.defined = defined ?? classConstraints.defined
        classConstraints.notnull = notnull ?? classConstraints.notnull
        classConstraints.fields = { ...classConstraints.fields, ...fields }

        if (id != null)
            Yop.registerClass(id, target)
    }
}
