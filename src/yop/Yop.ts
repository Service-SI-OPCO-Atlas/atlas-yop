import { validateConstraint } from "./constraints/Constraint"
import { MinMaxConstraints, validateMinMaxConstraints } from "./constraints/MinMaxConstraints"
import { MessageProvider, messageProvider_en_US, messageProvider_fr_FR } from "./MessageProvider"
import { ClassFieldDecorator, InternalClassConstraints } from "./Metadata"
import { joinPath, Path, splitPath } from "./PathUtil"
import { Constructor, isBoolean } from "./TypesUtil"
import { Group, InternalValidationContext, ValidationStatus } from "./ValidationContext"

(Symbol as any).metadata ??= Symbol.for("Symbol.metadata")

export const validationSymbol = Symbol('YopValidation')

export type AsyncValidationStatus = {
    status?: ValidationStatus | undefined
    dependencies: unknown
    getDependencies: (context: InternalValidationContext<any, any>) => any
    shouldRevalidate: (previous: unknown, current: unknown, status: ValidationStatus | undefined) => boolean
}

export type ResolvedConstraints<MinMax = unknown> = {
    required: boolean
    min?: MinMax
    max?: MinMax
}

export interface ValidateOptions {
    path?: string | Path
    groups?: Group
    ignore?: (path: Path) => boolean
    skipAsync?: boolean
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

    private contextAt(decorator: ClassFieldDecorator<any>, value: any, options: ValidateOptions, traverseNullish = false) {
        const metadata = { [validationSymbol]: {} as InternalClassConstraints }
        decorator(null, { metadata, name: "placeholder" } as any)        
        let constraints = metadata[validationSymbol]?.fields?.placeholder
        
        if (constraints == null)
            return undefined

        const segments = typeof options.path === "string" ? splitPath(options.path) : (options.path ?? [])
        if (segments == null)
            return undefined
        
        let context = new InternalValidationContext<any>({
            yop: this,
            kind: constraints.kind,
            value,
            options,
        })

        for (const segment of segments) {
            [constraints, value] = constraints.traverse?.(context, constraints, segment, traverseNullish) ?? [,]
            if (constraints == null)
                return undefined
            context = context.createChildContext({ kind: constraints.kind, value, key: segment })
        }
        
        return [context, constraints] as const
    }

    constraintsAt<MinMax = unknown>(path: string | Path, decorator: ClassFieldDecorator<any>, value: any) {
        const [context, constraints] = this.contextAt(decorator, value, { path: path }, true) ?? []

        if (context != null && constraints != null) {
            const resolvedContraints: ResolvedConstraints<MinMax> = { required: false }
            validateConstraint(context, constraints, "required", isBoolean, (_, constraint) => { resolvedContraints.required = constraint; return true })
            const isMinMaxType = (constraints as MinMaxConstraints<any, any>).isMinMaxType
            if (isMinMaxType != null) {
                validateMinMaxConstraints(
                    context,
                    constraints as MinMaxConstraints<unknown, unknown>,
                    isMinMaxType,
                    (_, min) => { resolvedContraints.min = min; return true },
                    (_, max) => { resolvedContraints.max = max; return true }
                )
            }
            return resolvedContraints
        }

        return undefined
    }
    static constraintsAt<Value>(path: string | Path, decorator: ClassFieldDecorator<Value>, value: any) {
        return Yop.init().constraintsAt(path, decorator, value)
    }

    getAsyncStatus(path: string | Path) {
        return this.asyncStatuses.get(typeof path === "string" ? path : joinPath(path))?.status
    }

    rawValidate<Value>(value: any, decorator: ClassFieldDecorator<Value>, options: ValidateOptions = { path: [] }
    ) {
        const [context, constraints] = this.contextAt(decorator, value, options) ?? []
        if (context != null && constraints != null)
            constraints.validate(context, constraints)
        return context
    }

    validate<Value>(
        value: any,
        decorator: ClassFieldDecorator<Value>,
        options: ValidateOptions = { path: [] }
    ) {
        const context = this.rawValidate(value, decorator, options)
        return context != null ? Array.from(context.statuses.values()) : []
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
