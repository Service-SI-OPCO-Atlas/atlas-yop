import { AnySchema, AsyncValidationResult, ConstraintsExecutor, createAsyncValidationResult, deepFreeze, SchemaForType, ValidationContext, ValidationError } from "./AnySchema"

export type ObjectPropertiesSchemas<T extends object | null | undefined> = { [P in keyof T]: SchemaForType<T[P]> }

export class ObjectSchema<T extends object | null | undefined> extends AnySchema<T> {

    readonly propertiesSchemas: ObjectPropertiesSchemas<T>
    readonly validationPath: string | null

    constructor(propertiesSchemas: ObjectPropertiesSchemas<T>, constraints?: ConstraintsExecutor<T>, validationPath: string | null = null) {
        super('object', constraints)
        this.propertiesSchemas = propertiesSchemas
        this.validationPath = validationPath
        deepFreeze(this)
    }

    protected clone(constraints?: ConstraintsExecutor<T>, validationPath: string | null = null) {
        return new ObjectSchema<T>(this.propertiesSchemas, constraints, validationPath) as this
    }

    override validateInContext(context: ValidationContext<T>): ValidationError[] {
        let errors = this.validateBasics(context)
        
        if (errors === undefined) {
            errors = []
            
            const value = context.value as any
            for (const [propertyName, schema] of Object.entries(this.propertiesSchemas)) {
                let propertySchema = (schema as AnySchema<any>)
                const propertyValue = value[propertyName]
                const propertyContext = {
                    userContext: context.userContext,
                    schema: propertySchema,
                    root: context.root ?? value,
                    parent: value,
                    path: context.path ? `${context.path}.${propertyName}` : propertyName,
                    value: propertyValue
                }

                propertySchema = AnySchema.resolveConditions(propertyContext as ValidationContext<any>)
                propertyContext.schema = propertySchema

                const propertyErrors = propertySchema.validateInContext(propertyContext as ValidationContext<any>)
                errors.push(...propertyErrors)
            }

            if (errors.length === 0)
                errors = super.validateTestCondition(context) ?? []
        }
        
        return errors
    }

    override validateAsyncInContext(context: ValidationContext<T>): AsyncValidationResult {
        const result = createAsyncValidationResult()
        
        // const errors = this.validateBasics(context)
        // if (errors != null) {
        //     result.errors.push(...errors)
        //     return result
        // }

        // const value = context.value as any
        // for (const [propertyName, schema] of Object.entries(this.propertiesSchemas)) {
        //     let propertySchema = (schema as AnySchema<any>)
        //     const propertyValue = value[propertyName]
        //     const propertyContext = {
        //         userContext: context.userContext,
        //         schema: propertySchema,
        //         root: context.root ?? value,
        //         parent: value,
        //         path: context.path ? `${context.path}.${propertyName}` : propertyName,
        //         value: propertyValue
        //     }

        //     propertySchema = AnySchema.resolveConditions(propertyContext as ValidationContext<any>)
        //     propertyContext.schema = propertySchema
            
        //     const propertyResult = propertySchema.validateAsyncInContext(propertyContext as ValidationContext<any>)
        //     result.errors.push(...propertyResult.errors)
        //     result.promises.push(...propertyResult.promises)
        // }

        // if (result.errors.length === 0 && result.promises.length === 0)
        //     result.errors.push(...super.validateTestCondition(context))
        
        // if (result.errors.length === 0 && result.promises.length === 0) {
        //     const promise = super.validateAsyncTestCondition(context)
        //     if (promise != null)
        //         result.promises.push(promise)
        // }

        return result
    }

    focusOn(validationPath: string) {
        return this.clone(this.constraints, validationPath)
    }

    override validate(value: any, userContext?: any): ValidationError[] {
        if (this.validationPath)
            return this.validateAt(this.validationPath, value, userContext) ?? []
        return super.validate(value, userContext)
    }

    override validateAsync(value: any, userContext?: any): AsyncValidationResult {
        if (this.validationPath)
            return this.validateAsyncAt(this.validationPath, value, userContext) ?? createAsyncValidationResult()
        return super.validateAsync(value, userContext)
    }

    validateAt(path: string, value: object, userContext?: any): ValidationError[] | null {
        return this.baseValidateAt(false, path, value, userContext) as (ValidationError[] | null)
    }

    validateAsyncAt(path: string, value: object, userContext?: any): AsyncValidationResult | null {
        return this.baseValidateAt(true, path, value, userContext) as (AsyncValidationResult | null)
    }
}
