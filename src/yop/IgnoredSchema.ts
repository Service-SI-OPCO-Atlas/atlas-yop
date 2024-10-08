import { AnySchema, AsyncValidationResult, createAsyncValidationResult, deepFreeze, SchemaConstraints, ValidationContext, ValidationError } from "./AnySchema"

export class IgnoredSchema extends AnySchema<any | null | undefined> {

    constructor() {
        super('ignored')
        deepFreeze(this)
    }

    protected clone(_?: SchemaConstraints): IgnoredSchema {
        throw new Error("IgnoredSchema isn't mutable!")
    }
    
    validateInContext(_: ValidationContext<any>): ValidationError[] {
        return []
    }
    
    override validateAsyncInContext(_: ValidationContext<any>): AsyncValidationResult {
        return createAsyncValidationResult()
    }
}