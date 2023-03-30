import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, PreserveUndefinedAndNull, Reference, RequiredType, SchemaConstraints, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema";

export class StringSchema<T extends string | null | undefined> extends AnySchema<T> {

    // eslint-disable-next-line
    static emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
  
    constructor(constraints?: SchemaConstraints) {
        super('string', constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new StringSchema<T>(constraints)
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
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            (this.constraints.regex && !context.value!.match(this.constraints.regex.value)) ?
            [createValidationError(context, this.constraints.regex.value === StringSchema.emailRegex ? 'email' : 'matches', this.constraints.regex.message)] :
            (super.validateTestCondition(context) ?? [])
        )
    }

    required(message?: Message) {
        return super.required(message) as unknown as StringSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as StringSchema<DefinedType<T>>
    }

    min<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message } }) as this
    }

    max<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, max: { value, message } }) as this
    }

    length<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message }, max: { value, message } }) as this
    }

    matches(value: RegExp, message?: Message) {
        return this.clone({ ...this.constraints, regex: { value, message } })
    }

    email(message?: Message) {
        return this.clone({ ...this.constraints, regex: { value: StringSchema.emailRegex, message } })
    }

    oneOf<U extends T>(values: ReadonlyArray<U>, message?: Message) {
        return super.createOneOf(values, message) as unknown as StringSchema<PreserveUndefinedAndNull<T, U>>
    }
}
