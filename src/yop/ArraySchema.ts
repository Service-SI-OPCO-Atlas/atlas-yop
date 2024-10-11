import { AnySchema, ConstraintsExecutor, ConstraintValue, deepFreeze, MaxConstraint, Message, MinConstraint, SchemaForType, TestConstraint, ValidationContext } from "./AnySchema"

class MinArrayConstraint extends MinConstraint<any[] | null | undefined, number> {
    
    override accept(value: any[], constraintValue: number) {
        return value.length >= constraintValue
    }
}

class MaxArrayConstraint extends MaxConstraint<any[] | null | undefined, number> {
    
    override accept(value: any[], constraintValue: number) {
        return value.length <= constraintValue
    }
}


type ArrayItemType<ArrayType> = ArrayType extends Array<infer ItemType> ? ItemType : never

export class ArraySchema<A extends any[] | null | undefined> extends AnySchema<A> {

    constructor(
        readonly elementSchema: SchemaForType<ArrayItemType<A> | null | undefined>,
        constraints?: ConstraintsExecutor<A>
    ) {
        super({ name: 'array', test: (value: any) => Array.isArray(value) }, constraints)
        deepFreeze(this)
    }

    protected clone(constraints?: ConstraintsExecutor<A>) {
        return new ArraySchema<A>(this.elementSchema, constraints) as this
    }

    override validateInContext(context: ValidationContext<A>) {
        let errors = super.validateInContext(context, { type: "exclude", constraints: TestConstraint })
        
        if (errors == null) {
            errors = []

            const array = (context.value as any[] | null | undefined)
            if (array != null) {
                const elementContext = {
                    userContext: context.userContext,
                    schema: this.elementSchema,
                    root: context.root,
                    parent: array,
                    path: context.path,
                    value: undefined
                }

                for (let [index, element] of array.entries()) {
                    elementContext.path = `${context.path ?? ''}[${index}]`
                    elementContext.value = element
                    errors.push(...this.elementSchema.validateInContext(elementContext) ?? [])
                }
            }
        }

        if (errors.length === 0)
            errors = super.validateInContext(context, { type: "include", constraints: TestConstraint }) ?? []

        return errors
    }

    // override validateAsyncInContext(context: ValidationContext<A>): AsyncValidationResult {
    //     const result = createAsyncValidationResult()

    //     let errors = this.validateBasics(context) ?? (
    //         !validateMinConstraint(context) ?
    //         [createValidationError(context, 'min', this.constraints.min!.message)] :
    //         !validateMaxConstraint(context) ?
    //         [createValidationError(context, 'max', this.constraints.max!.message)] :
    //         undefined
    //     )

    //     if (errors != null) {
    //         result.errors.push(...errors)
    //         return result
    //     }
        
    //     const array = context.value as any[]
    //     const elementContext = {
    //         userContext: context.userContext,
    //         schema: this.elementsSchema,
    //         root: context.root,
    //         parent: array,
    //         path: context.path,
    //         value: undefined
    //     }
        
    //     array.forEach((element, index) => {
    //         elementContext.path = `${context.path ?? ''}[${index}]`
    //         elementContext.value = element

    //         const elementResult = this.elementsSchema.validateAsyncInContext(elementContext)
    //         result.errors.push(...elementResult.errors)
    //         result.promises.push(...elementResult.promises)
    //     })

    //     if (result.errors.length === 0 && result.promises.length === 0)
    //         result.errors.push(...super.validateTestCondition(context))
        
    //     if (result.errors.length === 0 && result.promises.length === 0) {
    //         const promise = super.validateAsyncTestCondition(context)
    //         if (promise != null)
    //             result.promises.push(promise)
    //     }

    //     return result
    // }

    // validateAt(path: string, value: object, userContext?: any): ValidationError[] | null {
    //     return this.baseValidateAt(false, path, value, userContext) as (ValidationError[] | null)
    // }

    // validateAsyncAt(path: string, value: object, userContext?: any): AsyncValidationResult | null {
    //     return this.baseValidateAt(true, path, value, userContext) as (AsyncValidationResult | null)
    // }

    min(value: ConstraintValue<A, number>, message?: Message) {
        return this.addConstraints(new MinArrayConstraint(value as any, message))
    }

    max(value: ConstraintValue<A, number>, message?: Message) {
        return this.addConstraints(new MaxArrayConstraint(value as any, message))
    }

    length(value: ConstraintValue<A, number>, message?: Message) {
        return this.addConstraints(new MinArrayConstraint(value as any, message), new MaxArrayConstraint(value as any, message))
    }

    // min(value: number, message?: Message) {
    //     if (value <= 0 || isNaN(value))
    //         return this
    //     return this.clone({ ...this.constraints, min: { value, message } })
    // }

    // max(value: number, message?: Message) {
    //     if (value <= 0 || isNaN(value))
    //         return this
    //     return this.clone({ ...this.constraints, max: { value, message } })
    // }

    // length(value: number, message?: Message) {
    //     return this.clone({ ...this.constraints, min: { value, message }, max: { value, message } })
    // }
}
