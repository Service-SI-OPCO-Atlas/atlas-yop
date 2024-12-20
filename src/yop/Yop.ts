import { MessageProvider, MessageProvider_en_US, MessageProvider_fr_FR } from "./MessageProvider"
import { InternalClassConstraints } from "./Metadata"
import { Constructor } from "./types"
import { InternalValidationContext } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

function splitPath(path: string) {
    const segments: (string | number)[] = []
    for (const pathElement of path.split('.')) {
        const bracketIndex = pathElement.indexOf('[')
        const property = bracketIndex !== -1 ? pathElement.slice(0, bracketIndex) : pathElement
        if (property !== "")
            segments.push(property)
        if (bracketIndex !== -1)
            segments.push(parseInt(pathElement.slice(bracketIndex + 1, -1)))
    }
    return segments
}

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

    // validate<RootClass>(schema: Constructor<RootClass>, root: any, path?: string | Path<RootClass>) {
    //     const segments = splitPath(path ?? "")

    //     let constraints = schema[Symbol.metadata]?.[validationSymbol] as InternalClassConstraints | undefined
    //     if (constraints == null)
    //         return []
    
    //     let context = new InternalValidationContext({
    //         yop: this,
    //         kind: constraints.kind,
    //         value: root,
    //     })
    //     let value = root
    //     for (const segment of segments) {
    //         [constraints, value] = constraints.traverse?.(context, constraints, segment) ?? [,]
    //         if (constraints == null)
    //             return []
    //         context = context.createChildContext({ kind: constraints.kind, value, key: segment })
    //     }
    
    //     constraints.validate(context, constraints)
    //     return Array.from(context.errors.values())
    // }
    // static validate<RootClass>(schema: Constructor<RootClass>, value: any, path?: string | Path<RootClass>) {
    //     return Yop.init().validate(schema, value, path)
    // }

    validate<Value>(value: any, decorator: (_: any, context: ClassFieldDecoratorContext<unknown, Value>) => void, path?: string) {
        const metadata = { [validationSymbol]: {} as InternalClassConstraints }
        decorator(null, { metadata, name: "placeholder" } as any)
        
        let constraints = metadata[validationSymbol]?.fields?.placeholder
        if (constraints == null)
            return []

        const segments = splitPath(path ?? "")
        let context = new InternalValidationContext<unknown>({
            yop: this,
            kind: constraints.kind,
            value,
        })

        for (const segment of segments) {
            [constraints, value] = constraints.traverse?.(context, constraints, segment) ?? [,]
            if (constraints == null)
                return []
            context = context.createChildContext({ kind: constraints.kind, value, key: segment })
        }
        
        constraints.validate(context, constraints)
        return Array.from(context.errors.values())
    }
    static validate<Value>(value: any, decorator: (_: any, context: ClassFieldDecoratorContext<unknown, Value>) => void, path?: string) {
        return Yop.init().validate(value, decorator, path)
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


