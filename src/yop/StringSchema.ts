import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, PreserveUndefinedAndNull, Reference, RequiredType, SchemaConstraints, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema";

type StringVariant = 'email' | 'time'

export class StringSchema<T extends string | null | undefined> extends AnySchema<T> {

    // eslint-disable-next-line
    static readonly emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
    static readonly timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/

    static parseTime(time: string | null | undefined): number {
        if (time == null)
            return NaN
        const matched = time.match(StringSchema.timeRegex)
        if (matched == null)
            return NaN
        const hours = parseInt(matched[1])
        if (hours > 23)
            return NaN
        const minutes = parseInt(matched[2])
        if (minutes > 59)
            return NaN
        const seconds = matched[3] != null ? parseInt(matched[3].substring(1)) : 0
        if (seconds > 59)
            return NaN
        return (hours * 3600) + (minutes * 60) + seconds
    }

    static formatTime(time: number | null | undefined, modulo24h: true): string {
        function formatNumber(value: number) {
            return value.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false })
        }
        
        if (time == null || time < 0)
            return ""

        const hours = modulo24h ? Math.trunc(time / 3600) % 24 : Math.trunc(time / 3600)
        const minutes = Math.trunc((time % 3600) / 60)
        const seconds = time % 60
        
        if (seconds > 0)
            return `${ formatNumber(hours) }:${ formatNumber(minutes) }:${ formatNumber(seconds) }`
        return `${ formatNumber(hours) }:${ formatNumber(minutes) }`
    }

    readonly variant?: StringVariant
  
    constructor(constraints?: SchemaConstraints, variant?: StringVariant) {
        super('string', constraints)
        this.variant = variant
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints, variant?: StringVariant) {
        return new StringSchema<T>(constraints, variant ?? this.variant)
    }

    protected validateEmptyString(context: ValidationContext<T>): ValidationError[] | undefined {
        if (context.value!.length === 0) {
            if (!this.constraints.nullable.value && !this.constraints.optional.value)
                return [createValidationError(context, 'required', this.constraints.nullable.message ?? this.constraints.optional.message)]
            return []
        }
        return undefined
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
        return this.validateBasics(context) ?? this.validateEmptyString(context) ?? (
            (this.constraints.regex?.value.test(context.value!) === false) ?
            [createValidationError(context, this.variant ?? 'matches', this.constraints.regex.message)] :
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            super.validateTestCondition(context)
        )
    }

    required(message?: Message) {
        return super.required(message) as unknown as StringSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as StringSchema<DefinedType<T>>
    }

    min<P extends object = any, R extends object = any>(value: number | string | Reference<number | string, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message } }) as this
    }

    max<P extends object = any, R extends object = any>(value: number | string | Reference<number | string, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, max: { value, message } }) as this
    }

    length<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message }, max: { value, message } }) as this
    }

    matches(value: RegExp, message?: Message) {
        return this.clone({ ...this.constraints, regex: { value, message } })
    }

    email(message?: Message) {
        return this.clone({ ...this.constraints, regex: { value: StringSchema.emailRegex, message } }, 'email')
    }

    time(message?: Message) {
        return this.clone({ ...this.constraints, regex: { value: StringSchema.timeRegex, message } }, 'time')
    }

    oneOf<U extends T>(values: ReadonlyArray<U>, message?: Message) {
        return super.createOneOf(values, message) as unknown as StringSchema<PreserveUndefinedAndNull<T, U>>
    }

    getBound(value: string) {
        return this.variant === 'time' ? StringSchema.parseTime(value) : value.length
    }
}
