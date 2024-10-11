import { AbstractConstraint, AnySchema, ConstraintsExecutor, ConstraintValue, createValidationError, deepFreeze, MaxConstraint, Message, MinConstraint, OneOfConstraint, RequiredConstraint, resolveConstraintValue, ValidationContext } from "./AnySchema";

type StringVariant = 'email' | 'time'

class RequiredStringConstraint extends RequiredConstraint<string | null | undefined> {

    constructor(value: ConstraintValue<string | null | undefined, boolean> = true, message?: Message<string | null | undefined>) {
        super(value, message)
    }

    override validate(context: ValidationContext<string | null | undefined>) {
        return !context.value && resolveConstraintValue(this.value, context) === true
            ? [createValidationError(context, 'required', this.message, undefined, this.getErrorParams(context))]
            : undefined
    }
}

class MinStringConstraint extends MinConstraint<string | null | undefined, number> {
    
    override formatBound(value: number, context: ValidationContext<string | null | undefined>) {
        return context.schema.variant === 'time' ? StringSchema.formatTime(value) : value
    }
    
    override accept(value: string, constraintValue: number, context: ValidationContext<string | null | undefined>) {
        const bound = context.schema.variant === 'time' ? StringSchema.parseTime(value) : value.length
        return bound === 0 || bound >= constraintValue
    }
}

class MaxStringConstraint extends MaxConstraint<string | null | undefined, number> {
    
    override formatBound(value: number, context: ValidationContext<string | null | undefined>) {
        return context.schema.variant === 'time' ? StringSchema.formatTime(value) : value
    }
    
    override accept(value: string, constraintValue: number, context: ValidationContext<string | null | undefined>) {
        const bound = context.schema.variant === 'time' ? StringSchema.parseTime(value) : value.length
        return bound === 0 || bound <= constraintValue
    }
}

class RegExpConstraint extends AbstractConstraint<string | null | undefined> {

    constructor(readonly value: ConstraintValue<string | null | undefined, RegExp>, readonly message?: Message<string | null | undefined>) {
        super(9, false)
    }

    override validate(context: ValidationContext<string | null | undefined>) {
        const regexp = resolveConstraintValue(this.value, context)
        return !regexp.test(context.value!)
            ? [createValidationError(context, context.schema.variant ?? "matches", this.message, undefined, this.getErrorParams(context))]
            : undefined
    }
}


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

    static formatTime(time: number | null | undefined, modulo24h = true): string {
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
  
    constructor(constraints?: ConstraintsExecutor<T>, variant?: StringVariant) {
        super('string', constraints ?? new ConstraintsExecutor<T>(value => !value))
        this.variant = variant
        deepFreeze(this)
    }

    protected clone(constraints: ConstraintsExecutor<T>, variant?: StringVariant) {
        return new StringSchema<T>(constraints, variant ?? this.variant) as this
    }
    
    override required(value: ConstraintValue<T, boolean> = true, message?: Message) {
        return this.addConstraints(new RequiredStringConstraint(value, message))
    }

    min(value: ConstraintValue<T, number>, message?: Message) {
        return this.addConstraints(new MinStringConstraint(value as any, message))
    }

    max(value: ConstraintValue<T, number>, message?: Message) {
        return this.addConstraints(new MaxStringConstraint(value as any, message))
    }

    length(value: ConstraintValue<T, number>, message?: Message) {
        return this.addConstraints(new MinStringConstraint(value as any, message), new MaxStringConstraint(value as any, message))
    }

    matches(value: RegExp, message?: Message) {
        return this.addConstraints(new RegExpConstraint(value, message))
    }

    email(message?: Message) {
        return this.clone(this.constraints.clone().add(new RegExpConstraint(StringSchema.emailRegex, message)), "email")
    }

    time(message?: Message) {
        return this.clone(this.constraints.clone().add(new RegExpConstraint(StringSchema.timeRegex, message)), "time")
    }

    oneOf<U extends T>(values: ConstraintValue<T, readonly U[]>, message?: Message) {
        return this.addConstraints(new OneOfConstraint<T>(values, message))
    }

    // TODO: remove
    getBound(value: string) {
        return this.variant === 'time' ? StringSchema.parseTime(value) : value.length
    }
}
