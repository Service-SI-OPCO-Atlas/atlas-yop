import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, PreserveUndefinedAndNull, Reference, RequiredType, SchemaConstraints, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema"

export class NumberSchema<T extends number | null | undefined> extends AnySchema<T> {

    constructor(constraints?: SchemaConstraints) {
        super('number', constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new NumberSchema<T>(constraints)
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
        return this.validateBasics(context) ?? (
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            (super.validateTestCondition(context) ?? [])
        )
    }

    required(message?: Message) {
        return super.required(message) as unknown as NumberSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as NumberSchema<DefinedType<T>>
    }

    min<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message } }) as this
    }

    max<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, max: { value, message } }) as this
    }

    oneOf<U extends T>(values: ReadonlyArray<U>, message?: Message) {
        return super.createOneOf(values, message) as unknown as NumberSchema<PreserveUndefinedAndNull<T, U>>
    }
}

