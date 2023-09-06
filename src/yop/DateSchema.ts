import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, Reference, RequiredType, SchemaConstraints, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema"

export class DateSchema<T extends Date | null | undefined> extends AnySchema<T> {

    constructor(constraints?: SchemaConstraints) {
        super({ name: 'date', test: (value: any) => value instanceof Date }, constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new DateSchema<T>(constraints)
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
        return this.validateBasics(context) ?? (
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            super.validateTestCondition(context)
        )
    }

    required(message?: Message) {
        return super.required(message) as unknown as DateSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as DateSchema<DefinedType<T>>
    }

    min<P extends object = any, R extends object = any>(value: Date | Reference<Date, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message } }) as this
    }

    max<P extends object = any, R extends object = any>(value: Date | Reference<Date, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, max: { value, message } }) as this
    }
}
