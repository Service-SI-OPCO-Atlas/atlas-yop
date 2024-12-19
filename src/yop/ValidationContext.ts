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

export interface ValidationContext<ValueType, ParentType = unknown> {
    
    readonly kind: string
    readonly value: ValueType
    readonly parent: ParentType
    readonly path: string | undefined
    readonly root: unknown | undefined
    readonly userContext: unknown | undefined

    createError(code: string, constraint: any, message?: string, path?: string): false
    getRoot<T>(): T
    getUserContext<T>(): T
}

export class InternalValidationContext<ValueType, ParentType = unknown> implements ValidationContext<ValueType, ParentType> {

    readonly yop: Yop
    readonly parentContext: InternalValidationContext<ParentType> | undefined
    readonly kind: string
    readonly value: ValueType
    readonly parent: ParentType
    readonly path: string
    readonly root: unknown | undefined
    readonly userContext: unknown | undefined
    readonly group: Group | undefined
    readonly errors: Map<string | undefined, ValidationError>

    constructor(props: {
        yop: Yop
        kind: string
        value: ValueType
        parent: ParentType
        parentContext?: InternalValidationContext<ParentType> | undefined
        path?: string | undefined
        root?: unknown | undefined
        userContext?: unknown | undefined
        group?: Group
        errors?: Map<string | undefined, ValidationError>
    }) {
        this.yop = props.yop
        this.parentContext = props.parentContext
        this.kind = props.kind
        this.value = props.value
        this.parent = props.parent
        this.path = props.path ?? ""
        this.root = props.root
        this.userContext = props.userContext
        this.group = props.group
        this.errors = props.errors ?? new Map()
    }

    createChildContext(props: {
        kind: string
        value: ValueType
        propertyOrIndex: string | number
    }) {
        const path = typeof props.propertyOrIndex === "number" ?
            `${ this.path }[${ props.propertyOrIndex }]` :
            this.path ? `${ this.path }.${ props.propertyOrIndex }` : props.propertyOrIndex

        return new InternalValidationContext({
            yop: this.yop,
            kind: props.kind,
            value: props.value,
            parent: this.value,
            parentContext: this,
            path,
            root: this.root,
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

    getRoot<T>() {
        return this.root as T
    }

    getUserContext<T>() {
        return this.userContext as T
    }
}
