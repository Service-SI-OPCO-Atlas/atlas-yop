import { get, toPath } from "lodash"
import { AnySchema, createValidationError, deepFreeze, DefinedType, Message, RequiredType, SchemaConstraints, ValidationContext, ValidationError } from "./AnySchema"
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

type KeyedSchemas = { [key: string]: AnySchema<any> }

export class ObjectSchema<T extends object | null | undefined> extends AnySchema<T> {

    readonly propertiesSchemas: KeyedSchemas
    readonly validationPath: string | null

    constructor(propertiesSchemas: ObjectPropertiesSchemas<T>, constraints?: SchemaConstraints, validationPath: string | null = null) {
        super('object', constraints)
        this.propertiesSchemas = propertiesSchemas as KeyedSchemas
        this.validationPath = validationPath
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints, validationPath: string | null = null): this {
        return new ObjectSchema<T>(this.propertiesSchemas as ObjectPropertiesSchemas<T>, constraints, validationPath) as this
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
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

                let propertyErrors = propertySchema.validateInContext(propertyContext as ValidationContext<any>)
                if (propertyErrors.length === 0 && propertySchema.constraints.testCondition) {
                    const testContext = {
                        ...(propertyContext as ValidationContext<any>),
                        createError: (message: string) => {
                            propertyErrors = [createValidationError(propertyContext as ValidationContext<any>, 'test', message)]
                            return false
                        }
                    }
                    if (propertySchema.constraints.testCondition.value(testContext) === false && propertyErrors.length === 0)
                        propertyErrors = [createValidationError(
                            propertyContext as any,
                            propertySchema.constraints.testCondition.code ?? 'test',
                            propertySchema.constraints.testCondition.message
                        )]
                }
                
                errors.push(...propertyErrors)
            }

            if (errors.length === 0)
                errors = super.validateTestCondition(context) ?? []
        }
        
        return errors
    }

    required(message?: Message) {
        return super.required(message) as unknown as ObjectSchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as ObjectSchema<DefinedType<T>>
    }

    focusOn(validationPath: string) {
        return this.clone(this.constraints, validationPath)
    }

    validate(value: any, userContext?: any): ValidationError[] {
        if (this.validationPath)
            return this.validateAt(this.validationPath, value, userContext) ?? []
        return super.validate(value, userContext)
    }

    validateAt(path: string, value: object, userContext?: any): ValidationError[] | null {
        if (path === '')
            return this.validate(value, userContext)

        const schemaAtPath = this.schemaAt(path, value, userContext)
        if (!schemaAtPath)
            return null
        
        const pathElements = toPath(path)
        const parent = pathElements.length > 1 ? get(value, pathElements.slice(0, -1)) : value
        const valueAtPath = get(parent, pathElements[pathElements.length - 1])
        return schemaAtPath.validateInContext({ path, root: value, parent: parent, schema: schemaAtPath as any, value: valueAtPath })
    }

    schemaAt(path: string, value: object, userContext?: any): AnySchema<any> | null {
        if (path === '')
            return this as AnySchema<any>

        const context: ValidationContext<any> = {
            userContext: userContext,
            root: value,
            parent: value,
            schema: this as any,
            value: value
        }

        const pathSegments = toPath(path)
        let pathSegment: string | undefined = undefined
        
        // eslint-disable-next-line no-cond-assign
        while (pathSegment = pathSegments.shift()) {
            switch (context.schema.getType()) {
                case 'object':
                    context.path = context.path != null ? `${context.path}.${pathSegment}` : pathSegment
                    context.schema = (context.schema as unknown as ObjectSchema<any>).propertiesSchemas[pathSegment] as any
                    break
                case 'array':
                    context.path = `${context.path ?? ''}[${pathSegment}]`
                    context.schema = (context.schema as unknown as ArraySchema<any>).elementsSchema
                    break
                default:
                    return null
            }

            if (context.schema == null)
                break
            
            context.parent = context.value
            context.value = get(context.value, pathSegment)
            context.schema = AnySchema.resolveConditions(context)
        }

        return context.schema ?? null
    }
}
