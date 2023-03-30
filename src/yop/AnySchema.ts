import { ArraySchema } from "./ArraySchema"
import { BooleanSchema } from "./BooleanSchema"
import { DateSchema } from "./DateSchema"
import { FileSchema } from "./FileSchema"
import { ErrorMessages } from "./localization"
import { NumberSchema } from "./NumberSchema"
import { ObjectSchema } from "./ObjectSchema"
import { StringSchema } from "./StringSchema"
import Yop from "./Yop"

export type SchemaForType<T> =
    [T] extends [string | null | undefined] ? StringSchema<T> :
    [T] extends [number | null | undefined] ? NumberSchema<T> :
    [T] extends [boolean | null | undefined] ? BooleanSchema<T> :
    [T] extends [Date | null | undefined] ? DateSchema<T> :
    [T] extends [File | null | undefined] ? FileSchema<T> :
    [T] extends [any[] | null | undefined] ? ArraySchema<T> :
    [T] extends [object | null | undefined] ? ObjectSchema<T> :
    never

export interface ValidationContext<T, P extends object = any, R extends object = any, C = any> {
    userContext?: C
    schema: SchemaForType<T>
    root?: R
    parent?: P
    path?: string
    value: T
}

export interface TestValidationContext<T, P extends object = any, R extends object = any> extends ValidationContext<T, P, R> {
    createError: (message: string, code?: keyof ErrorMessages, path?: string) => boolean
}

export type ValidationError = {
    path?: string
    value: any
    code: string
    message: string
}

export type Message<T = any, P extends object = any, R extends object = any> = string | ((context: ValidationContext<T, P, R>) => string)

export const createValidationError = (context: ValidationContext<any>, code: keyof ErrorMessages, message?: Message, path?: string): ValidationError => {
    const errorMessages = Yop.getErrorMessages()

    let errorMessage: string
    if (typeof message === 'function')
        errorMessage = message(context)
    else {
        const typeName = (typeof context.schema.type === 'string') ? context.schema.type : context.schema.type.name
        const template: string = (
            message ??
            (errorMessages[typeName] as any)?.[code] ??
            (errorMessages['all'] as any)[code] ??
            'Unknown error'
        )
        const params: Record<string, any> = {
            min: context.schema.constraints.min?.value,
            max: context.schema.constraints.max?.value,
            nullable: context.schema.constraints.nullable?.value,
            optional: context.schema.constraints.optional?.value,
            value: context.value,
            oneOfValues: context.schema.constraints.testCondition?.oneOfValues
        }
        errorMessage = template.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => {
            let value = params[key]
            if (['min', 'max', 'value', 'oneOfValues'].includes(key) && errorMessages[typeName]?.format) {
                const format = errorMessages[typeName].format!
                value = Array.isArray(value) ? value.map(element => format(element)) : format(value)
            }
            if (Array.isArray(value))
                value = value.join(', ')
            return value
        })
    }
    return { path: path ?? context.path, value: context.value, code, message: errorMessage }
}

export type Condition<T, P extends object = any, R extends object = any> = (context: ValidationContext<T, P, R>) => boolean
export type TestCondition<T, P extends object = any, R extends object = any> = (context: TestValidationContext<T, P, R>) => boolean
export type ConditionWithSchema<T, P extends object = any, R extends object = any> = (context: ValidationContext<T, P, R>) => SchemaForType<T> | null | undefined
export type Reference<T, P extends object = any, R extends object = any> = (context: ValidationContext<T, P, R>) => T | null | undefined

export type Constraint<T> = {
    value: T
    code?: keyof ErrorMessages
    message?: Message
    oneOfValues?: any[]
}

export class SchemaConstraints {
    nullable: Constraint<boolean> = { value: true }
    optional: Constraint<boolean> = { value: true }
    min?: Constraint<number | Date | Reference<number> | Reference<Date>>
    max?: Constraint<number | Date | Reference<number> | Reference<Date>>
    regex?: Constraint<RegExp>

    requiredCondition?: Constraint<Condition<any>>
    whenCondition?: ConditionWithSchema<any>
    testCondition?: Constraint<TestCondition<any>>

    ignored = false
    ignoredCondition?: Constraint<Condition<any>>
}

const validateMinMaxConstraint = (
    context: ValidationContext<any | null | undefined>,
    test: (constraintValue: number, value: number) => boolean,
    constraint?: Constraint<number | Date | Reference<number> | Reference<Date>>) => {
    if (constraint !== undefined) {
        let constraintValue = constraint.value
        if (typeof constraintValue === 'function') {
            const result = constraintValue(context as any)
            if (result === null || result === undefined)
                return true
            constraintValue = result
        }
        if (constraintValue instanceof Date)
            constraintValue = constraintValue.getTime()
        const value =
            context.value instanceof Date ? context.value.getTime() :
            context.value instanceof File ? context.value.size :
            Array.isArray(context.value) ? context.value.length :
            typeof context.value === 'string' ? context.value.length :
            typeof context.value === 'number' ? context.value :
            undefined
        if (value !== undefined)
            return test(constraintValue, value)
    }
    return true
}

export const validateMinConstraint = (context: ValidationContext<any | null | undefined>) => {
    return validateMinMaxConstraint(context, (constraintValue, value) => value >= constraintValue, context.schema.constraints.min)
}

export const validateMaxConstraint = (context: ValidationContext<any | null | undefined>) => {
    return validateMinMaxConstraint(context, (constraintValue, value) => value <= constraintValue, context.schema.constraints.max)
}


export type RequiredType<T> = Exclude<T, null | undefined>
export type DefinedType<T> = Exclude<T, undefined>
export type PreserveUndefinedAndNull<T, U> =
    T extends [undefined | null] ?
        U | undefined | null :
    T extends undefined ?
        U | undefined :
    T extends null ?
        U | null :
    U

type TypeTester = {
    name: string
    test: (value: any) => boolean
}

export function deepFreeze(o: any, stack = new Set<any>()) {
    const tag = Object.prototype.toString.call(o)
    if ((tag === '[object Object]' || tag === '[object Array]') && !stack.has(o)) {
        Object.freeze(o)
        
        stack.add(o)
        Object.values(o as any).forEach(value => deepFreeze(value, stack))
        stack.delete(o)
    }
}

export abstract class AnySchema<T> {

    type: string | TypeTester
    constraints: SchemaConstraints

    getType() {
        return (typeof this.type === 'string') ? this.type : this.type.name
    }

    protected constructor(type: string | TypeTester, constraints?: SchemaConstraints) {
        this.constraints = constraints ?? new SchemaConstraints()
        this.type = type
    }

    protected abstract clone(constraints?: SchemaConstraints): any

    protected validateBasics(context: ValidationContext<any>): ValidationError[] | undefined {
        if (this.constraints.ignored || this.constraints.ignoredCondition?.value(context) === true)
            return []
        if (context.value === null)
            return this.constraints.nullable.value ? [] : [createValidationError(context, 'required', this.constraints.nullable.message)]
        if (context.value === undefined)
            return this.constraints.optional.value ? [] : [createValidationError(context, 'required', this.constraints.optional.message)]
        if ((typeof this.type === 'string') ? (typeof context.value !== this.type) : !this.type.test(context.value))
            return [createValidationError(context, 'type')]
        return undefined
    }
    
    abstract validateInContext(context: ValidationContext<any>): ValidationError[]

    static resolveConditions(context: ValidationContext<any>) {
        let schema = context.schema
        if (schema.constraints.requiredCondition?.value(context))
            schema = schema.required(schema.constraints.requiredCondition.message)
        if ((context.value === null && !schema.constraints.nullable.value) || (context.value === undefined && !schema.constraints.optional.value))
            return schema
        if (schema.constraints.whenCondition)
            schema = schema.constraints.whenCondition(context) ?? schema
        if (typeof schema.constraints.min?.value === 'function') {
            const value = schema.constraints.min.value(context as any)
            if (value !== null && value !== undefined)
                schema = (schema as any).clone({ ...schema.constraints, min: { value, message: schema.constraints.min.message } })
        }
        if (typeof schema.constraints.max?.value === 'function') {
            const value = schema.constraints.max.value(context as any)
            if (value !== null && value !== undefined)
                schema = (schema as any).clone({ ...schema.constraints, max: { value, message: schema.constraints.max.message } })
        }
        return schema
    }

    validate(value: any, userContext?: any): ValidationError[] {  
        return this.validateInContext({ userContext: userContext, schema: this as any, value })
    }

    ignored(value = true): this {
        return this.clone({ ...this.constraints, ignored: value }) as this
    }
    
    ignoredIf<P extends object = any, R extends object = any>(condition: Condition<T, P, R>): this {
        if (this.constraints.ignoredCondition)
            throw new Error("Yop doesn't allow multiple ignoredIf conditions!")
        return this.clone({ ...this.constraints, ignoredCondition: { value: condition } }) as this
    }
    
    required(message?: Message) {
        return this.clone({ ...this.constraints, nullable: { value: false, message }, optional: { value: false, message } })
    }
    
    requiredIf<P extends object = any, R extends object = any>(condition: Condition<T, P, R>, message?: Message<T, P, R>): this {
        if (this.constraints.requiredCondition)
            throw new Error("Yop doesn't allow multiple requiredIf conditions!")
        return this.clone({ ...this.constraints, requiredCondition: { value: condition, message } }) as this
    }
    
    defined(message?: Message) {
        return this.clone({ ...this.constraints, optional: { value: false, message } })
    }

    when<P extends object = any, R extends object = any>(condition: ConditionWithSchema<T, P, R>): this {
        if (this.constraints.whenCondition)
            throw new Error("Yop doesn't allow multiple when conditions!")
        return this.clone({ ...this.constraints, whenCondition: condition }) as this
    }

    test<P extends object = any, R extends object = any>(condition: TestCondition<T, P, R>, message?: Message): this {
        if (this.constraints.testCondition)
            throw new Error("Yop doesn't allow multiple test conditions!")
        return this.clone({ ...this.constraints, testCondition: { value: condition, code: 'test', message } }) as this
    }

    protected createOneOf<U extends T>(values: ReadonlyArray<U>, message?: Message): this {
        return this.clone({ ...this.constraints, testCondition: {
            value: context => values.includes(context.value as U),
            code: 'oneOf',
            message,
            oneOfValues: [ ...values ]
        }}) as this
    }

    protected validateTestCondition(context: ValidationContext<T>) {
        if (this.constraints.testCondition) {
            let errors: ValidationError[] = []
            const testContext: TestValidationContext<T> = {
                ...context,
                createError: (message: string, code: keyof ErrorMessages = 'test', path?: string) => {
                    errors = [createValidationError(context, code, message, path)]
                    return false
                }
            }
            if (this.constraints.testCondition.value(testContext) === false && errors.length === 0)
                errors = [createValidationError(
                    context,
                    this.constraints.testCondition.code ?? 'test',
                    this.constraints.testCondition.message,
                )]
            return errors
        }
        return undefined
    }
}
