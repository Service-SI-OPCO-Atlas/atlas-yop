import { get } from "lodash-es"
import { AnySchema, ConstraintsExecutor, deepFreeze, TestConstraint, ValidationContext, ValidationError } from "./AnySchema"
import { ArraySchema } from "./ArraySchema"
import { BooleanSchema } from "./BooleanSchema"
import { DateSchema } from "./DateSchema"
import { FileSchema } from "./FileSchema"
import { NumberSchema } from "./NumberSchema"
import { StringSchema } from "./StringSchema"

export type SchemaType<Schema> = Schema extends AnySchema<infer PropertyType> ?
    [PropertyType] extends [string | null | undefined] ?
        StringSchema<PropertyType> :
    [PropertyType] extends [number | null | undefined] ?
        NumberSchema<PropertyType> :
    [PropertyType] extends [boolean | null | undefined] ?
        BooleanSchema<PropertyType> :
    [PropertyType] extends [Date | null | undefined] ?
        DateSchema<PropertyType> :
    [PropertyType] extends [File | null | undefined] ?
        FileSchema<PropertyType> :
    [PropertyType] extends [any[] | null | undefined] ?
        ArraySchema<PropertyType> :
    [PropertyType] extends [object | null | undefined] ?
        ObjectSchema<PropertyType> :
    never : never

export type ObjectPropertiesSchemas<T> = { [P in keyof T]: SchemaType<AnySchema<T[P]>> }

export class ObjectSchema<T extends object | null | undefined> extends AnySchema<T> {

    constructor(
        readonly propertiesSchemas: ObjectPropertiesSchemas<T>,
        constraints?: ConstraintsExecutor<T>,
        readonly validationPath?: string
    ) {
        super('object', constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: ConstraintsExecutor<T>, validationPath?: string) {
        return new ObjectSchema<T>(this.propertiesSchemas, constraints, validationPath) as this
    }

    override validateInContext(context: ValidationContext<T>) {
        let errors = super.validateInContext(context, { type: "exclude", constraints: TestConstraint })
        
        if (errors == null) {
            errors = []
            
            const value = context.value as any
            if (value != null) {
                for (const [propertyName, schema] of Object.entries(this.propertiesSchemas)) {
                    const propertySchema = (schema as AnySchema<any>)
                    const propertyValue = value[propertyName]
                    const propertyContext = {
                        userContext: context.userContext,
                        schema: propertySchema,
                        root: context.root ?? value,
                        parent: value,
                        path: context.path ? `${context.path}.${propertyName}` : propertyName,
                        value: propertyValue
                    }
                    const propertyErrors = propertySchema.validateInContext(propertyContext as ValidationContext<any>) ?? []
                    errors.push(...propertyErrors)
                }
            }
        }

        if (errors.length === 0)
            errors = super.validateInContext(context, { type: "include", constraints: TestConstraint }) ?? []
        
        return errors
    }

    // override validateAsyncInContext(context: ValidationContext<T>): AsyncValidationResult {
    //     const result = createAsyncValidationResult()
        
    //     // const errors = this.validateBasics(context)
    //     // if (errors != null) {
    //     //     result.errors.push(...errors)
    //     //     return result
    //     // }

    //     // const value = context.value as any
    //     // for (const [propertyName, schema] of Object.entries(this.propertiesSchemas)) {
    //     //     let propertySchema = (schema as AnySchema<any>)
    //     //     const propertyValue = value[propertyName]
    //     //     const propertyContext = {
    //     //         userContext: context.userContext,
    //     //         schema: propertySchema,
    //     //         root: context.root ?? value,
    //     //         parent: value,
    //     //         path: context.path ? `${context.path}.${propertyName}` : propertyName,
    //     //         value: propertyValue
    //     //     }

    //     //     propertySchema = AnySchema.resolveConditions(propertyContext as ValidationContext<any>)
    //     //     propertyContext.schema = propertySchema
            
    //     //     const propertyResult = propertySchema.validateAsyncInContext(propertyContext as ValidationContext<any>)
    //     //     result.errors.push(...propertyResult.errors)
    //     //     result.promises.push(...propertyResult.promises)
    //     // }

    //     // if (result.errors.length === 0 && result.promises.length === 0)
    //     //     result.errors.push(...super.validateTestCondition(context))
        
    //     // if (result.errors.length === 0 && result.promises.length === 0) {
    //     //     const promise = super.validateAsyncTestCondition(context)
    //     //     if (promise != null)
    //     //         result.promises.push(promise)
    //     // }

    //     return result
    // }

    focusOn(validationPath: string) {
        return this.clone(this.constraints, validationPath)
    }

    override validate(value: any, userContext?: any) {
        if (this.validationPath)
            return this.validateAt(this.validationPath, value, userContext) ?? []
        return super.validate(value, userContext) ?? []
    }

    validateAt(path: string, value: object, userContext?: any): ValidationError[] | undefined {
        if (path === "")
            return super.validate(value, userContext) ?? []
        
        const schemaAtPath = this.schemaAt(path)
        if (schemaAtPath == null)
            return undefined
        return schemaAtPath.validateInContext({ schema: schemaAtPath as any, value: get(value, path), userContext, path })
    }

    // override validateAsync(value: any, userContext?: any): AsyncValidationResult {
    //     if (this.validationPath)
    //         return this.validateAsyncAt(this.validationPath, value, userContext) ?? createAsyncValidationResult()
    //     return super.validateAsync(value, userContext)
    // }

    // validateAsyncAt(path: string, value: object, userContext?: any): AsyncValidationResult | null {
    //     return this.baseValidateAt(true, path, value, userContext) as (AsyncValidationResult | null)
    // }
}
