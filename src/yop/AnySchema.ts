import { get, toPath } from "lodash-es"
import { ArraySchema } from "./ArraySchema"
import { BooleanSchema } from "./BooleanSchema"
import { DateSchema } from "./DateSchema"
import { FileSchema } from "./FileSchema"
import { ErrorMessages } from "./localization"
import { NumberSchema } from "./NumberSchema"
import { ObjectSchema } from "./ObjectSchema"
import { StringSchema } from "./StringSchema"
import { Yop } from "./Yop"

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
    createError: (message: string, path?: string) => boolean
}

export type ValidationError = {
    path?: string
    value: any
    code: string
    message: string
}

export type AsyncValidationStatus = "skipped" | "pending" | "valid" | "invalid" | "unavailable"

export type AsyncValidationError = ValidationError & {
    status: AsyncValidationStatus
    reason?: any
}

export const AsyncValidationSkipped = (undefined as any)

export const createAsyncValidationResult = (errors?: ValidationError[]) => { return {
    errors: (errors ?? []) as ValidationError[],
    promises: [] as Promise<AsyncValidationError[]>[]
}}

export type AsyncValidationResult = ReturnType<typeof createAsyncValidationResult>

export type Message<T = any, P extends object = any, R extends object = any> = string | ((context: ValidationContext<T, P, R>) => string)

export const createValidationError = (context: ValidationContext<any>, code: keyof ErrorMessages, message?: Message, path?: string, params?: Record<string, any>): ValidationError => {
    const errorMessages = Yop.getErrorMessages()

    let errorMessage: string
    if (typeof message === 'function')
        errorMessage = message(context)
    else {
        const typeName = (typeof context.schema.type === 'string') ? context.schema.type : context.schema.type.name
        const variant = context.schema.variant ?? ''
        const template: string = (
            message ??
            (errorMessages[typeName + '$' + variant] as any)?.[code] ??
            (errorMessages[typeName] as any)?.[code] ??
            (errorMessages['all'] as any)[code] ??
            'Unknown error'
        )
        // const params: Record<string, any> = {
        //     min: context.schema.constraints.min?.value,
        //     max: context.schema.constraints.max?.value,
        //     nullable: context.schema.constraints.nullable?.value,
        //     optional: context.schema.constraints.optional?.value,
        //     value: context.value,
        //     oneOfValues: context.schema.constraints.testCondition?.oneOfValues
        // }
        errorMessage = template.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => {
            let value = params?.[key]
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
export type AsyncTestCondition<T, P extends object = any, R extends object = any> = (context: TestValidationContext<T, P, R>) => Promise<boolean>
export type ConditionWithSchema<T, P extends object = any, R extends object = any> = (context: ValidationContext<T, P, R>) => SchemaForType<T> | null | undefined
export type Reference<T, P extends object = any, R extends object = any> = (context: ValidationContext<T, P, R>) => T | null | undefined


export type ConstraintValue<FieldType, ValueType> =  ValueType | ((context: ValidationContext<FieldType>) => ValueType)
export function resolveConstraintValue<FieldType, ValueType>(value: ConstraintValue<FieldType, ValueType>, context: ValidationContext<FieldType>) {
    if (typeof value === 'function')
        return (value as ((context: ValidationContext<FieldType>) => ValueType))(context)
    return value as ValueType
}

export abstract class AbstractConstraint<FieldType> {

    constructor(
        readonly priority: number,
        readonly multiple: boolean,
        readonly acceptNull = false
    ) {}

    abstract validate(context: ValidationContext<FieldType>): ValidationError[] | undefined

    /*
        const params: Record<string, any> = {
            min: context.schema.constraints.min?.value,
            max: context.schema.constraints.max?.value,
            nullable: context.schema.constraints.nullable?.value,
            optional: context.schema.constraints.optional?.value,
            value: context.value,
            oneOfValues: context.schema.constraints.testCondition?.oneOfValues
        }
    */
    getErrorParams(context: ValidationContext<FieldType>): Record<string, any> {
        return {
            value: context.value
        }
    }
}

export class IgnoredConstraint extends AbstractConstraint<any> {

    constructor(readonly value: ConstraintValue<any, boolean> = true) {
        super(0, false, true)
    }

    validate(context: ValidationContext<any>) {
        return resolveConstraintValue(this.value, context) === true
            ? []
            : undefined
    }
}


export class DefinedConstraint<FieldType> extends AbstractConstraint<FieldType> {

    constructor(readonly value: ConstraintValue<FieldType, boolean> = true, readonly message?: Message<FieldType>) {
        super(1, false, true)
    }

    validate(context: ValidationContext<FieldType>) {
        return context.value === undefined && resolveConstraintValue(this.value, context) === true
            ? [createValidationError(context, 'required', this.message, undefined, this.getErrorParams(context))]
            : undefined
    }
}

export class RequiredConstraint<FieldType> extends AbstractConstraint<FieldType> {

    constructor(readonly value: ConstraintValue<FieldType, boolean> = true, readonly message?: Message<FieldType>) {
        super(2, false, true)
    }

    validate(context: ValidationContext<FieldType>) {
        return context.value == null && resolveConstraintValue(this.value, context) === true
            ? [createValidationError(context, 'required', this.message, undefined, this.getErrorParams(context))]
            : undefined
    }
}

export class TypeConstraint extends AbstractConstraint<any> {

    constructor() {
        super(3, false, true)
    }

    validate(context: ValidationContext<any>) {
        if (context.value != null && (typeof context.schema.type === 'string' ? typeof context.value !== context.schema.type : !context.schema.type.test(context.value)))
            return [createValidationError(context, 'type')]
        return undefined
    }
}

abstract class BoundConstraint<FieldType, BoundType> extends AbstractConstraint<FieldType> {

    constructor(
        priority: number,
        readonly code: keyof ErrorMessages,
        readonly value: ConstraintValue<FieldType, BoundType>,
        readonly message?: Message<FieldType>
    ) {
        super(priority, false)
    }

    formatBound(value: BoundType, _: ValidationContext<FieldType>): any {
        return value
    }

    abstract accept(value: NonNullable<FieldType>, constraintValue: BoundType, context: ValidationContext<FieldType>): boolean

    validate(context: ValidationContext<FieldType>) {
        const constraintValue = resolveConstraintValue(this.value, context)
        return !this.accept(context.value!, constraintValue, context)
            ? [createValidationError(context, this.code, this.message, undefined, { ...this.getErrorParams(context), [this.code]: this.formatBound(constraintValue, context) })]
            : undefined
    }
}

export abstract class MinConstraint<FieldType, MinType> extends BoundConstraint<FieldType, MinType> {
    
    constructor(value: ConstraintValue<FieldType, MinType>, message?: Message<FieldType>) {
        super(10, "min", value, message)
    }
}

export abstract class MaxConstraint<FieldType, MinType> extends BoundConstraint<FieldType, MinType> {
    
    constructor(value: ConstraintValue<FieldType, MinType>, message?: Message<FieldType>) {
        super(11, "max", value, message)
    }
}

export class OneOfConstraint<FieldType> extends AbstractConstraint<NonNullable<FieldType>> {

    constructor(readonly values: ConstraintValue<FieldType, readonly FieldType[]>, readonly message?: Message<FieldType>) {
        super(12, true)
    }

    validate(context: ValidationContext<NonNullable<FieldType>>) {
        const values = resolveConstraintValue(this.values, context)
        return !values.includes(context.value as NonNullable<FieldType>)
            ? [createValidationError(context, 'oneOf', this.message, undefined, { ...this.getErrorParams(context), oneOfValues: values })]
            : undefined
    }
}

export class TestConstraint<FieldType> extends AbstractConstraint<NonNullable<FieldType>> {

    constructor(readonly value: ((context: ValidationContext<NonNullable<FieldType>>) => boolean), readonly message?: Message<FieldType>) {
        super(100, true)
    }

    validate(context: ValidationContext<NonNullable<FieldType>>) {
        return !this.value(context)
            ? [createValidationError(context, 'test', this.message, undefined, this.getErrorParams(context))]
            : undefined
    }
}


export type Constraint<T> = {
    value: T
    code?: keyof ErrorMessages
    message?: Message
    oneOfValues?: any[]
}


export class SchemaConstraints {
    nullable: Constraint<boolean> = { value: true }
    optional: Constraint<boolean> = { value: true }
    min?: Constraint<any>
    max?: Constraint<any>
    regex?: Constraint<RegExp>

    requiredCondition?: Constraint<Condition<any>>
    whenCondition?: ConditionWithSchema<any>
    testCondition?: Constraint<TestCondition<any>>
    asyncTestCondition?: Constraint<AsyncTestCondition<any>>

    ignored = false
    ignoredCondition?: Constraint<Condition<any>>
}

type AnyValidationContext = ValidationContext<any | null | undefined>

const validateMinMaxConstraint = (context: AnyValidationContext, test: (constraintValue: number, value: number) => boolean, constraint?: Constraint<any>) => {
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
        else if (typeof constraintValue === 'string')
            constraintValue = context.schema.getBound(constraintValue)
        const value =
            context.value instanceof Date ? context.value.getTime() :
            context.value instanceof File ? context.value.size :
            Array.isArray(context.value) ? context.value.length :
            typeof context.value === 'string' ? context.schema.getBound(context.value) :
            typeof context.value === 'number' ? context.value :
            undefined
        if (value !== undefined)
            return test(constraintValue, value)
    }
    return true
}

export const validateMinConstraint = (context: AnyValidationContext) => {
    return validateMinMaxConstraint(context, (constraintValue, value) => value >= constraintValue, context.schema.constraints.min)
}

export const validateMaxConstraint = (context: AnyValidationContext) => {
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

export function getParentPath(path: string | null | undefined) {
    if (path == null)
        return path

    if (path.indexOf("'") !== -1 || path.indexOf('"') !== -1)
        throw new Error(`Unsupported path with ' or " characters: ${ path }`)
    
    const lastDot = path.lastIndexOf('.')
    const lastBracket = path.lastIndexOf('[')

    const end = lastDot !== -1 ?
        (lastBracket !== -1 ? Math.max(lastDot, lastBracket) : lastDot) :
        (lastBracket !== -1 ? lastBracket : -1)
    
    if (end === -1)
        return null
    return path.substring(0, end)
}


export class ConstraintsExecutor<FieldType> {

    private constraints = new Array<AbstractConstraint<FieldType>>(new TypeConstraint())

    add(constraint: AbstractConstraint<FieldType>, clear = false) {
        if (clear && constraint.multiple)
            this.constraints = this.constraints.filter(c => c instanceof constraint.constructor === false)
        
        if (constraint.multiple)
            this.constraints.push(constraint)
        else {
            const index = this.constraints.findIndex(c => c instanceof constraint.constructor)
            if (index >= 0)
                this.constraints[index] = constraint
            else
                this.constraints.push(constraint)
        }
        
        this.constraints.sort((a, b) => a.priority - b.priority)
        
        return this
    }

    removeAll(constraintClass: new (...args: any[]) => AbstractConstraint<FieldType>) {
        this.constraints = this.constraints.filter(c => !(c instanceof constraintClass))
        
        return this
    }

    validate(context: ValidationContext<FieldType>): ValidationError[] {
        const nullishValue = this.isNull != null ? this.isNull(context.value) : context.value == null

        for (const constraint of this.constraints) {
            if (constraint.acceptNull === false && nullishValue)
                continue
            const errors = constraint.validate(context)
            if (errors != null)
                return errors
        }

        return []
    }

    clone() {
        const clone = new ConstraintsExecutor<FieldType>(this.isNull)
        clone.constraints = this.constraints.concat()
        return clone
    }

    constructor(
        readonly isNull?: (value: any) => boolean
    ) {}
}


export abstract class AnySchema<T> {

    readonly type: string | TypeTester
    readonly constraints: SchemaConstraints

    protected constraintsExecutor: ConstraintsExecutor<T>

    getType() {
        return (typeof this.type === 'string') ? this.type : this.type.name
    }

    protected constructor(type: string | TypeTester, constraints?: SchemaConstraints, constraintsExecutor?: ConstraintsExecutor<T>) {
        this.constraints = constraints ?? new SchemaConstraints()
        this.constraintsExecutor = constraintsExecutor ?? new ConstraintsExecutor<T>()
        this.type = type
    }

    protected abstract clone(constraints?: SchemaConstraints | ConstraintsExecutor<T>): this

    protected addConstraints(...constraints: AbstractConstraint<T>[]) {
        const constraintsExecutor = this.constraintsExecutor.clone()
        for (const constraint of constraints)
            constraintsExecutor.add(constraint)
        return this.clone(constraintsExecutor)
    }

    protected validateBasics(context: ValidationContext<T>): ValidationError[] | undefined {
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
    
    validateInContext(context: ValidationContext<T>): ValidationError[] {
        return this.constraintsExecutor.validate(context)
    }

    validateAsyncInContext(context: ValidationContext<T>): AsyncValidationResult {
        const result = createAsyncValidationResult(this.validateInContext(context))
        if (result.errors.length === 0) {
            const promise = this.validateAsyncTestCondition(context)
            if (promise != null)
                result.promises.push(promise)
        }
        return result
    }

    static resolveConditions(context: ValidationContext<any>) {
        let schema = context.schema
        // if (schema.constraints.requiredCondition?.value(context))
        //     schema = schema.required(schema.constraints.requiredCondition.message)
        // if ((context.value === null && !schema.constraints.nullable.value) || (context.value === undefined && !schema.constraints.optional.value))
        //     return schema
        // if (schema.constraints.whenCondition)
        //     schema = schema.constraints.whenCondition(context) ?? schema
        // if (typeof schema.constraints.min?.value === 'function') {
        //     const value = schema.constraints.min.value(context as any)
        //     if (value !== null && value !== undefined)
        //         schema = (schema as any).clone({ ...schema.constraints, min: { value, message: schema.constraints.min.message } })
        // }
        // if (typeof schema.constraints.max?.value === 'function') {
        //     const value = schema.constraints.max.value(context as any)
        //     if (value !== null && value !== undefined)
        //         schema = (schema as any).clone({ ...schema.constraints, max: { value, message: schema.constraints.max.message } })
        // }
        return schema
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

    validate(value: any, userContext?: any): ValidationError[] {  
        return this.constraintsExecutor.validate({ userContext: userContext, schema: this as any, value })
    }

    validateAsync(value: any, userContext?: any): AsyncValidationResult {
        return this.validateAsyncInContext({ userContext: userContext, schema: this as any, value })
    }

    ignored(value: ConstraintValue<T, boolean> = true) {
        return this.addConstraints(new IgnoredConstraint(value))
    }
    
    required(value: ConstraintValue<T, boolean> = true, message?: Message) {
        return this.clone(this.constraintsExecutor.clone().add(new RequiredConstraint(value, message)))
    }
    
    defined(value: ConstraintValue<T, boolean> = true, message?: Message) {
        return this.clone(this.constraintsExecutor.clone().add(new DefinedConstraint(value, message)))
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

    asyncTest<P extends object = any, R extends object = any>(condition: AsyncTestCondition<T, P, R>, message?: Message): this {
        if (this.constraints.asyncTestCondition)
            throw new Error("Yop doesn't allow multiple async test conditions!")
        return this.clone({ ...this.constraints, asyncTestCondition: { value: condition, code: 'asyncTest', message } }) as this
    }

    protected createOneOf<U extends T>(values: ReadonlyArray<U>, message?: Message): this {
        return this.clone({ ...this.constraints, testCondition: {
            value: context => values.includes(context.value as U),
            code: 'oneOf',
            message,
            oneOfValues: [ ...values ]
        }}) as this
    }

    protected validateTestCondition(context: ValidationContext<T>): ValidationError[] {
        let errors: ValidationError[] = []
        
        if (this.constraints.testCondition != null) {
            const testContext: TestValidationContext<T> = {
                ...context,
                createError: (message: string, path?: string) => {
                    errors.push(createValidationError(context, "test", message, path))
                    return false
                }
            }
            
            if (this.constraints.testCondition.value(testContext) === false && errors.length === 0) {
                errors = [createValidationError(
                    context,
                    this.constraints.testCondition.code ?? 'test',
                    this.constraints.testCondition.message,
                )]
            }
        }

        return errors
    }

    protected validateAsyncTestCondition(context: ValidationContext<T>): Promise<AsyncValidationError[]> | undefined {
        if (this.constraints.asyncTestCondition == null)
            return undefined
        
        let error: AsyncValidationError | undefined = undefined

        const testContext: TestValidationContext<T> = {
            ...context,
            createError: (message: string, path?: string) => {
                error = { ...createValidationError(context, "asyncTest", message, path), status: "invalid" }
                return false
            }
        }

        const asyncTestCondition = this.constraints.asyncTestCondition
        return new Promise(resolve => {
            asyncTestCondition.value(testContext)
                .then(success => {
                    if (success)
                        error = { ...createValidationError(context, 'asyncTest', 'Async test successful'), status: "valid" }
                    else if (error == null)
                        error = { ...createValidationError(context, 'asyncTest', asyncTestCondition.message), status: "invalid" }
                    resolve([error])
                })
                .catch(reason => {
                    if (reason == null)
                        error = { ...createValidationError(context, 'asyncTest', "Async test skipped"), status: "skipped" }
                    else {
                        error = {
                            ...createValidationError(context, 'asyncTest', reason.message ?? reason.toString?.()),
                            status: "unavailable",
                            reason: reason
                        }
                    }
                    resolve([error])
                })
        })
    }

    protected baseValidateAt(async: boolean, path: string, value: object, userContext?: any): ValidationError[] | AsyncValidationResult | null {
        if (path === '')
            return this.validate(value, userContext)

        const schemaAtPath = this.schemaAt(path, value, userContext)
        if (!schemaAtPath)
            return null
        
        const pathElements = toPath(path)
        const parent = pathElements.length > 1 ? get(value, pathElements.slice(0, -1)) : value
        const valueAtPath = get(parent, pathElements[pathElements.length - 1])

        const context = { path, root: value, parent: parent, schema: schemaAtPath as any, value: valueAtPath, userContext }
        return async ? schemaAtPath.validateAsyncInContext(context) : schemaAtPath.validateInContext(context)
    }
}
