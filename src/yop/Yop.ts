import { MessageProvider, messageProvider_en_US, messageProvider_fr_FR } from "./MessageProvider"
import { ClassFieldDecorator, InternalClassConstraints } from "./Metadata"
import { Path, splitPath } from "./PathUtil"
import { Constructor } from "./TypesUtil"
import { Group, InternalValidationContext, ValidationStatus } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

export type AsyncValidationStatus = {
    status?: ValidationStatus | undefined
    dependencies: unknown
    getDependencies: (context: InternalValidationContext<unknown>) => unknown
    shouldRevalidate: (previous: unknown, current: unknown, status: ValidationStatus | undefined) => boolean
}

export class Yop {

    private static defaultInstance?: Yop
    private static classIds = new Map<string, Constructor<unknown>>()
    
    private static messageProviders = new Map<string, MessageProvider>()
    static {
        this.registerMessageProvider(messageProvider_en_US)
        this.registerMessageProvider(messageProvider_fr_FR)
    }

    private locale: string = Yop.defaultInstance?.locale ?? "en-US"
    
    readonly asyncStatuses = new Map<string, AsyncValidationStatus>()

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

    validate<Value>(value: any, decorator: ClassFieldDecorator<Value>, options: { path?: string | Path, groups?: Group } = { path: [] }) {
        const metadata = { [validationSymbol]: {} as InternalClassConstraints }
        decorator(null, { metadata, name: "placeholder" } as any)        
        let constraints = metadata[validationSymbol]?.fields?.placeholder
        
        if (constraints == null)
            return []

        const segments = typeof options.path === "string" ? splitPath(options.path) : (options.path ?? [])
        if (segments == null)
            return []
        
        let context = new InternalValidationContext<unknown>({
            yop: this,
            kind: constraints.kind,
            groups: options.groups,
            value,
        })

        for (const segment of segments) {
            [constraints, value] = constraints.traverse?.(context, constraints, segment) ?? [,]
            if (constraints == null)
                return []
            context = context.createChildContext({ kind: constraints.kind, value, key: segment })
        }
        
        constraints.validate(context, constraints)
        return Array.from(context.statuses.values())
    }
    static validate<Value>(value: any, decorator: ClassFieldDecorator<Value>, options?: { path?: string, groups?: Group }) {
        return Yop.init().validate(value, decorator, options)
    }

    static registerMessageProvider(provider: MessageProvider) {
        try {
            const locale = Intl.getCanonicalLocales(provider.locale)[0]
            Yop.messageProviders.set(locale, provider)
        }
        catch (e) {
            console.error(`Invalid locale "${ provider.locale }" in message provider. Ignoring.`, e)
        }
    }

    getLocale() {
        return this.locale
    }
    static getLocale() {
        return Yop.init().locale
    }
    
    setLocale(locale: string) {
        try {
            locale = Intl.getCanonicalLocales(locale)[0]
            if (Yop.messageProviders.has(locale))
                this.locale = locale
            else
                console.error(`No message provider for locale "${ locale }". Ignoring`)
        }
        catch (e) {
            console.error(`Invalid locale "${ locale }". Ignoring.`, e)
        }
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
