import { AnySchema, AsyncValidationError, AsyncValidationResult, createAsyncValidationResult, createValidationError, deepFreeze, DefinedType, Message, RequiredType, SchemaConstraints, SchemaForType, validateMaxConstraint, validateMinConstraint, ValidationContext, ValidationError } from "./AnySchema"

export class ArraySchema<T extends any> extends AnySchema<T> {

    readonly elementsSchema: SchemaForType<T | null | undefined>

    constructor(elementType: SchemaForType<T | null | undefined>, constraints?: SchemaConstraints) {
        super({ name: 'array', test: (value: any) => Array.isArray(value) }, constraints)
        this.elementsSchema = elementType
        deepFreeze(this)
    }

    protected clone(constraints?: SchemaConstraints) {
        return new ArraySchema<T>(this.elementsSchema, constraints)
    }

    validateInContext(context: ValidationContext<T>): ValidationError[] {
        const array = (context.value as any[] | null | undefined)

        let errors = this.validateBasics(context) ?? (
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            undefined
        )
        
        if (errors === undefined) {
            errors = []

            const elementContext = {
                userContext: context.userContext,
                schema: this.elementsSchema,
                root: context.root,
                parent: array,
                path: context.path,
                value: undefined
            }
            
            array?.forEach((element, index) => {
                elementContext.path = `${context.path ?? ''}[${index}]`
                elementContext.value = element
                errors!.push(...this.elementsSchema.validateInContext(elementContext as any))
            })

            if (errors.length === 0)
                errors = super.validateTestCondition(context)
        }

        return errors
    }

    validateAsyncInContext(context: ValidationContext<T>): AsyncValidationResult {
        const result = createAsyncValidationResult()

        let errors = this.validateBasics(context) ?? (
            !validateMinConstraint(context) ?
            [createValidationError(context, 'min', this.constraints.min!.message)] :
            !validateMaxConstraint(context) ?
            [createValidationError(context, 'max', this.constraints.max!.message)] :
            undefined
        )

        if (errors != null) {
            result.errors.push(...errors)
            return result
        }
        
        const array = context.value as any[]
        const elementContext = {
            userContext: context.userContext,
            schema: this.elementsSchema,
            root: context.root,
            parent: array,
            path: context.path,
            value: undefined
        }
        
        array.forEach((element, index) => {
            elementContext.path = `${context.path ?? ''}[${index}]`
            elementContext.value = element

            const elementResult = this.elementsSchema.validateAsyncInContext(elementContext as ValidationContext<any>)
            result.errors.push(...elementResult.errors)
            result.promises.push(...elementResult.promises)
        })

        if (result.errors.length === 0 && result.promises.length === 0)
            result.errors.push(...super.validateTestCondition(context))
        
        if (result.errors.length === 0 && result.promises.length === 0) {
            const promise = super.validateAsyncTestCondition(context)
            if (promise != null)
                result.promises.push(promise)
        }

        return result
    }

    validateAt(path: string, value: object, userContext?: any): ValidationError[] | null {
        return this.baseValidateAt(false, path, value, userContext) as (ValidationError[] | null)
    }

    validateAsyncAt(path: string, value: object, userContext?: any): AsyncValidationResult | null {
        return this.baseValidateAt(true, path, value, userContext) as (AsyncValidationResult | null)
    }

    required(message?: Message) {
        return super.required(message) as unknown as ArraySchema<RequiredType<T>>
    }

    defined(message?: Message) {
        return super.defined(message) as unknown as ArraySchema<DefinedType<T>>
    }

    min(value: number, message?: Message) {
        if (value <= 0 || isNaN(value))
            return this
        return this.clone({ ...this.constraints, min: { value, message } })
    }

    max(value: number, message?: Message) {
        if (value <= 0 || isNaN(value))
            return this
        return this.clone({ ...this.constraints, max: { value, message } })
    }

    length(value: number, message?: Message) {
        return this.clone({ ...this.constraints, min: { value, message }, max: { value, message } })
    }
}
