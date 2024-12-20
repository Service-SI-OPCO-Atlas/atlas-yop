import { Yop } from "./Yop"

export type Group = string | ((string | undefined)[])

export type ValidationError = {
    path?: string
    value: any
    kind: string
    code: string
    constraint: any
    message: string
}

export interface ValidationContext<Value, Parent = unknown> {
    
    readonly kind: string

    readonly value: Value
    readonly key: string | number | undefined
    readonly path: string

    readonly parent: Parent
    readonly parentContext: ValidationContext<Parent> | undefined

    getRoot<T>(): T | undefined
    readonly rootContext: ValidationContext<unknown> | undefined

    getUserContext<T>(): T | undefined
}

export const UndefinedParent = Object.freeze(Object.create(null))

export class InternalValidationContext<Value, Parent = unknown> implements ValidationContext<Value, Parent> {

    readonly yop: Yop

    readonly kind: string

    readonly value: Value
    readonly key: string | number | undefined
    readonly path: string

    readonly parentContext: InternalValidationContext<Parent> | undefined
    readonly rootContext: InternalValidationContext<unknown> | undefined
    readonly userContext: unknown | undefined

    readonly group: Group | undefined
    readonly errors: Map<string | undefined, ValidationError>

    constructor(props: {
        yop: Yop
        kind: string
        value: Value
        key?: string | number | undefined
        parentContext?: InternalValidationContext<Parent> | undefined
        rootContext?: InternalValidationContext<unknown> | undefined
        userContext?: unknown | undefined
        group?: Group
        errors?: Map<string | undefined, ValidationError>
    }) {
        this.yop = props.yop
        this.kind = props.kind
        this.value = props.value
        this.parentContext = props.parentContext
        this.key = props.key
        this.rootContext = props.rootContext
        this.userContext = props.userContext
        this.group = props.group
        this.errors = props.errors ?? new Map()

        if (props.parentContext != null && props.key == null)
            throw new Error("propertyOrIndex must be provided when parentContext is provided")

        this.path = (
            props.parentContext == null && props.key == null ? "" :
            typeof props.key === "number" ? `${ props.parentContext?.path ?? "" }[${ props.key }]` :
            props.parentContext?.path ? `${ props.parentContext.path }.${ props.key! }` : props.key!
        )
    }

    get parent() {
        return this.parentContext?.value || UndefinedParent as Parent
    }

    getRoot<T>() {
        return this.rootContext?.value as T | undefined
    }

    getUserContext<T>() {
        return this.userContext as T | undefined
    }

    createChildContext(props: {
        kind: string
        value: Value
        key: string | number
    }) {
        return new InternalValidationContext({
            yop: this.yop,
            kind: props.kind,
            value: props.value,
            key: props.key,
            parentContext: this,
            rootContext: this.rootContext ?? this,
            userContext: this.userContext,
            group: this.group,
            errors: this.errors,
        })
    }

    matchGroup(group: Group | undefined) {
        if (group == null)
            return this.group == null || (Array.isArray(this.group) && this.group.includes(undefined))
        if (Array.isArray(group))
            return Array.isArray(this.group) ? group.some(g => (this.group as (string | undefined)[]).includes(g)) : group.includes(this.group)
        return (Array.isArray(this.group) ? this.group.includes(group) : this.group === group)
    }

    createError(code: string, constraint: any, message?: string, path?: string): false {
        const errorPath = path ?? this.path
        this.errors.set(errorPath, {
            path: errorPath,
            value: this.value,
            kind: this.kind,
            code,
            constraint,
            message: this.yop.messageProvider.getMessage(this, code, constraint, message, errorPath),
        })
        return false
    }
}

export type NonNullableContext<Value, Parent> = InternalValidationContext<NonNullable<Value>, Parent>

