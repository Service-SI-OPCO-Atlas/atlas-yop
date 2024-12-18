import { CommonConstraints } from "./constraints/CommonConstraints"
import { initTypeConstraints, InternalTypeConstraints } from "./decorators/type"
import { Path, splitPath } from "./Path"
import { Constructor } from "./types"
import { InternalValidationContext, ValidationError } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

type ContraintsValue<Contraints> = Contraints extends CommonConstraints<infer Value, infer _Parent> ? Value : never
type ContraintsParent<Contraints> = Contraints extends CommonConstraints<infer _Value, infer Parent> ? Parent : never

type Validator<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>> =
    (context: InternalValidationContext<Value, Parent>, constraints: Constraints) => boolean

type Traverser<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>> =
    ((context: InternalValidationContext<Value, Parent>, constraints: Constraints, propertyOrIndex: string | number) =>
    readonly [InternalCommonConstraints | undefined, InternalValidationContext<unknown>])

export interface InternalCommonConstraints extends CommonConstraints<unknown> {
    /**
     * The kind of the decorated value (eg: `string`, `number`, etc.)
     */
    kind: string
    /**
     * The method that validates the decorated value.
     */
    validate: Validator<this>
    /**
     * The method that returns the constraints and value of a nested field.
     */
    traverse?: Traverser<this>
}

export class Yop {

    private static defaultInstance?: Yop

    private static classIds = new Map<string, Constructor<unknown>>()

    static registerClass(id: string, constructor: Constructor<unknown>) {
        Yop.classIds.set(id, constructor)
    }

    static resolveClass(id: unknown) {
        if (typeof id === "string") {
            const resolved = Yop.classIds.get(id)
            if (resolved == null)
                console.error(`Class "${ id }" unregistered in Yop. Did you forget to add a @constraints({ id: "${ id }" }) decorator to the class?`)
            return resolved
        }
        return id
    }

    validate<RootClass>(schema: Constructor<RootClass>, root: any, path?: string | Path<RootClass>) {
        const segments = splitPath(path ?? "")

        let constraints = schema[Symbol.metadata]?.[validationSymbol] as InternalTypeConstraints | undefined
        if (constraints == null)
            return new Map<string | undefined, ValidationError>()
    
        let context = new InternalValidationContext({
            yop: this,
            kind: constraints.kind,
            value: root,
            parent: {},
            root,
        })
        let value = root
        for (const segment of segments) {
            [constraints, value] = constraints.traverse?.(context, constraints, segment) ?? [,]
            if (constraints == null)
                return new Map<string | undefined, ValidationError>()
            context = context.createChildContext({ kind: constraints.kind, value, propertyOrIndex: segment })
        }
    
        constraints.validate(context, constraints)
        return context.errors
    }
    static validate<RootClass>(schema: Constructor<RootClass>, value: any, path?: string | Path<RootClass>) {
        return Yop.init().validate(schema, value, path)
    }

    validateValue<Value>(value: any, decorator: (_: any, context: ClassFieldDecoratorContext<unknown, Value>) => void) {
        const metadata = { [validationSymbol]: {} as InternalTypeConstraints }
        decorator(null, { metadata, name: "placeholder" } as any)
        const constraints = metadata[validationSymbol]!.fields!.placeholder

        const context = new InternalValidationContext<unknown>({
            yop: this,
            kind: constraints.kind,
            value: value,
            parent: {},
            root: {},
        })
        
        constraints.validate(context, constraints)
        return context.errors.get(undefined)
    }

    static validateValue<Value>(value: any, decorator: (_: any, context: ClassFieldDecoratorContext<unknown, Value>) => void) {
        return Yop.init().validateValue(value, decorator)
    }

    static init(): Yop {
        if (Yop.defaultInstance == null)
            Yop.defaultInstance = new Yop()
        return Yop.defaultInstance
    }
}

export function fieldValidationDecorator<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>>(
    kind: string,
    constraints: Constraints,
    validate: Validator<Constraints>,
    traverse?: Traverser<Constraints>
) {
    return function decorateClassField(_: any, context: ClassFieldDecoratorContext<Parent, Value>) {
        const classConstraints = initTypeConstraints(context.metadata)
        if (!Object.hasOwnProperty.bind(classConstraints)("fields"))
            classConstraints.fields = { ...classConstraints.fields }

        const fieldName = context.name as string
        const fields = classConstraints.fields!        
        if (!Object.hasOwnProperty.bind(fields)(fieldName))
            fields[fieldName] = {} as InternalCommonConstraints
        
        Object.assign(fields[fieldName], { ...constraints, kind, validate, traverse })
    }
}
