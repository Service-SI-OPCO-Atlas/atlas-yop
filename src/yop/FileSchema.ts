import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, Reference, RequiredType, SchemaConstraints, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema"

export class FileSchema<T extends File | null | undefined> extends AnySchema<T> {

    constructor(constraints?: SchemaConstraints) {
        super({ name: 'file', test: (value: any) => value instanceof File }, constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new FileSchema<T>(constraints)
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
        return super.required(message) as unknown as FileSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as FileSchema<DefinedType<T>>
    }

    min<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, min: { value, message } }) as this
    }

    max<P extends object = any, R extends object = any>(value: number | Reference<number, P, R>, message?: Message): this {
        return this.clone({ ...this.constraints, max: { value, message } }) as this
    }
}
