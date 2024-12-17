import { CommonConstraints } from "./constraints/CommonConstraints"
import { initTypeConstraints, InternalClassConstraints, validateType } from "./decorators/type"
import { Path, splitPath } from "./Path"
import { Constructor } from "./types"
import { ValidationContext, ValidationError } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

export interface InternalCommonConstraints extends CommonConstraints<unknown> {
    /**
     * The kind of the decorated value (eg: `string`, `number`, etc.).
     */
    kind: string
    /**
     * The kind of the decorated value (eg: `string`, `number`, etc.).
     */
    validate: (context: ValidationContext<unknown>, constraints: InternalCommonConstraints) => void
}

export interface ValidationHolder<Constraints = InternalCommonConstraints> {
    [validationSymbol]: Constraints
}

// export interface ConstraintsTraverser<Constraints extends CommonConstraints<any, any>> {
//     constraintsAt?: (yop: Yop, constraints: Constraints, pathSegment: string) => (CommonConstraints<unknown> & Kind) | undefined
// }

export class Yop {

    private static defaultInstance?: Yop

    private static classIds = new Map<string, Constructor<unknown>>()

    static registerClass(id: string, constructor: Constructor<unknown>) {
        Yop.classIds.set(id, constructor)
    }

    static getClass(id: unknown) {
        if (typeof id === "string") {
            const resolved = Yop.classIds.get(id)
            if (resolved == null)
                console.error(`Class "${ id }" unregistered in Yop. Did you forget to add a @constraints({ id: "${ id }" }) decorator to the class?`)
            return resolved
        }
        return id
    }

    validate<RootClass>(schema: Constructor<RootClass>, parent: any, path?: string | Path<RootClass>) {
        const segments = splitPath(path ?? "")

        let constraints = schema[Symbol.metadata]?.[validationSymbol] as InternalClassConstraints
        if (constraints == null)
            return new Map<string | undefined, ValidationError>()
    
        let value = parent
        for (const segment of segments) {
            constraints = (constraints as any)[segment]
            if (constraints == null)
                return new Map<string | undefined, ValidationError>()

            parent = value
            if (value !== undefined)
                value = (typeof value === "object") ? (value as any)[segment] : undefined
        }
    
        const context = new ValidationContext({
            yop: this,
            kind: "class",
            value,
            parent,
        })
    
        constraints.validate(context, constraints)
        return context.errors
    }
    static validate<RootClass>(schema: Constructor<RootClass>, value: any, path?: string | Path<RootClass>) {
        return Yop.init().validate(schema, value, path)
    }

    static init(): Yop {
        if (Yop.defaultInstance == null)
            Yop.defaultInstance = new Yop()
        return Yop.defaultInstance
    }
}

type ContraintsField<Contraints> = Contraints extends CommonConstraints<infer Field, infer _Parent> ? Field : never
type ContraintsParent<Contraints> = Contraints extends CommonConstraints<infer _Field, infer Parent> ? Parent : never
export function fieldValidationDecorator<Constraints, Field = ContraintsField<Constraints>, Parent = ContraintsParent<Constraints>>(
    kind: string,
    constraints: Constraints,
    validate: (context: ValidationContext<Field, Parent>, constraints: Constraints) => void
) {
    return function decorateClassField(_: any, context: ClassFieldDecoratorContext<Parent, Field>) {
        const classConstraints = initTypeConstraints(context.metadata)
        if (!Object.hasOwnProperty.bind(classConstraints)("fields"))
            classConstraints.fields = { ...classConstraints.fields }

        const fieldName = context.name as string
        const fields = classConstraints.fields!        
        if (!Object.hasOwnProperty.bind(fields)(fieldName))
            fields[fieldName] = {} as InternalCommonConstraints
        
        Object.assign(fields[fieldName], { ...constraints, kind, validate })
    }
}
