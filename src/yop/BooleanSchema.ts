import { AnySchema, deepFreeze, DefinedType, Message, PreserveUndefinedAndNull, RequiredType, SchemaConstraints, ValidationContext, ValidationError } from "./AnySchema"

export class BooleanSchema<T extends boolean | null | undefined> extends AnySchema<T> {

    constructor(constraints?: SchemaConstraints) {
        super('boolean', constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new BooleanSchema<T>(constraints)
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
        return this.validateBasics(context) ?? super.validateTestCondition(context)
    }

    required(message?: Message) {
        return super.required(message) as unknown as BooleanSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as BooleanSchema<DefinedType<T>>
    }

    oneOf<U extends T>(values: ReadonlyArray<U>, message?: Message) {
        return super.createOneOf(values, message) as unknown as BooleanSchema<PreserveUndefinedAndNull<T, U>>
    }
}
