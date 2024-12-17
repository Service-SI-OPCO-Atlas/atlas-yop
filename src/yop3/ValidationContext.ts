import { Yop } from "./Yop"

export type GroupType = string | ((string | undefined)[])

export type ValidationError = {
    path?: string
    value: any
    kind: string
    code: string
    constraint: any
    message: string
}

export class ValidationContext<ValueType, ParentType = unknown> {

    readonly yop: Yop
    readonly kind: string
    readonly value: ValueType
    readonly parent: ParentType
    readonly path: string | undefined
    readonly root: unknown | undefined
    readonly userContext: unknown | undefined
    readonly group: GroupType | undefined
    readonly errors: Map<string | undefined, ValidationError>

    constructor(props: {
        yop: Yop
        kind: string
        value: ValueType
        parent: ParentType
        path?: string | undefined
        root?: unknown | undefined
        userContext?: unknown | undefined
        group?: GroupType
        errors?: Map<string | undefined, ValidationError>
    }) {
        this.yop = props.yop
        this.kind = props.kind
        this.value = props.value
        this.parent = props.parent
        this.path = props.path
        this.root = props.root
        this.userContext = props.userContext
        this.group = props.group
        this.errors = props.errors ?? new Map()
    }

    createChildContext(props: {
        kind: string
        value: ValueType
        path?: string | undefined
    }) {
        return new ValidationContext({
            yop: this.yop,
            kind: props.kind,
            value: props.value,
            parent: this.value,
            path: props.path,
            root: this.root,
            userContext: this.userContext,
            group: this.group,
            errors: this.errors,
        })
    }

    createError(code: string, constraint: any, message?: string, path?: string): false {
        this.errors.set(this.path, {
            path: path ?? this.path,
            value: this.value,
            kind: this.kind,
            code,
            constraint,
            message: message ?? code
        })
        return false
    }

    matchGroup(group: GroupType | undefined) {
        if (group == null)
            return this.group == null || (Array.isArray(this.group) && this.group.includes(undefined))
        if (Array.isArray(group))
            return Array.isArray(this.group) ? group.some(g => (this.group as (string | undefined)[]).includes(g)) : group.includes(this.group)
        return (Array.isArray(this.group) ? this.group.includes(group) : this.group === group)
    }

    getRoot<T>() {
        return this.root as T
    }

    getUserContext<T>() {
        return this.userContext as T
    }
}
