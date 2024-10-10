import { AnySchema, AsyncValidationResult, createAsyncValidationResult, deepFreeze, IgnoredConstraint, SchemaConstraints, ValidationContext, ValidationError } from "./AnySchema"

export class IgnoredSchema extends AnySchema<any | null | undefined> {

    constructor() {
        super('ignored')
        this.constraintsExecutor.add(new IgnoredConstraint())
        deepFreeze(this)
    }

    protected clone(_?: SchemaConstraints): this {
        throw new Error("IgnoredSchema isn't mutable!")
    }
    
    override validateAsyncInContext(_: ValidationContext<any>): AsyncValidationResult {
        return createAsyncValidationResult()
    }
}