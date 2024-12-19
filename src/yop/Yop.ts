import { ContraintsParent, ContraintsValue, InternalCommonConstraints, Traverser, Validator } from "./constraints/CommonConstraints"
import { initTypeConstraints, InternalTypeConstraints } from "./decorators/type"
import { MessageProvider, MessageProvider_en_US, MessageProvider_fr_FR } from "./MessageProvider"
import { Path, splitPath } from "./Path"
import { Constructor } from "./types"
import { InternalValidationContext, ValidationError } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

export class Yop {

    private static defaultInstance?: Yop
    private static classIds = new Map<string, Constructor<unknown>>()
    
    private static messageProviders = new Map<string, MessageProvider>()
    static {
        this.registerMessageProvider(new MessageProvider_en_US())
        this.registerMessageProvider(new MessageProvider_fr_FR())
    }

    private locale = "en-US"

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
        return Array.from(context.errors.values())
    }
    static validateValue<Value>(value: any, decorator: (_: any, context: ClassFieldDecoratorContext<unknown, Value>) => void) {
        return Yop.init().validateValue(value, decorator)
    }

    static registerMessageProvider(provider: MessageProvider) {
        const locale = Intl.getCanonicalLocales(provider.locale)[0]
        Yop.messageProviders.set(locale, provider)
    }

    getLocale() {
        return this.locale
    }
    static getLocale() {
        return Yop.init().locale
    }
    
    setLocale(locale: string) {
        locale = Intl.getCanonicalLocales(locale)[0]
        if (!Yop.messageProviders.has(locale))
            throw new Error(`No message provider for locale "${ locale }"`)
        this.locale = locale
    }
    static setLocale(locale: string) {
        Yop.init().setLocale(locale)
    }

    get messageProvider() {
        return Yop.messageProviders.get(this.locale)!
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
