import { AnySchema, AsyncValidationResult, createAsyncValidationResult, deepFreeze, IgnoredConstraint, ValidationContext } from "./AnySchema"

export class IgnoredSchema extends AnySchema<any | null | undefined> {

    constructor() {
        super('ignored')
        this.constraints.add(new IgnoredConstraint())
        deepFreeze(this)
    }

    protected clone(): this {
        throw new Error("IgnoredSchema isn't mutable!")
    }
    
    override validateAsyncInContext(_: ValidationContext<any>): AsyncValidationResult {
        return createAsyncValidationResult()
    }
}