import { ConstraintMessage } from "./constraints/Constraint"
import { Yop } from "./Yop"

export type Group = string | ((string | undefined)[])
export type Level = "info" | "warning" | "error" | "pending" | "unavailable"

export type ValidationStatus = {
    level: Level
    path: string
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

    readonly groups: Group | undefined
    readonly statuses: Map<string | undefined, ValidationStatus>

    constructor(props: {
        yop: Yop
        kind: string
        value: Value
        key?: string | number | undefined
        parentContext?: InternalValidationContext<Parent> | undefined
        rootContext?: InternalValidationContext<unknown> | undefined
        userContext?: unknown | undefined
        groups?: Group
        statuses?: Map<string | undefined, ValidationStatus>
    }) {
        this.yop = props.yop
        this.kind = props.kind
        this.value = props.value
        this.parentContext = props.parentContext
        this.key = props.key
        this.rootContext = props.rootContext
        this.userContext = props.userContext
        this.groups = props.groups
        this.statuses = props.statuses ?? new Map()

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
            groups: this.groups,
            statuses: this.statuses,
        })
    }

    createStatus(code: string, constraint: any, message?: ConstraintMessage, level: Level = "error"): ValidationStatus {
        return {
            level,
            path: this.path,
            value: this.value,
            kind: this.kind,
            code,
            constraint,
            message: this.yop.messageProvider.getMessage(this, code, constraint, message, level),
        }
    }

    setStatus(code: string, constraint: any, message?: ConstraintMessage, level: Level = "error"): ValidationStatus {
        const status = this.createStatus(code, constraint, message, level)
        this.statuses.set(this.path, status)
        return status
    }
}

export type ValuedContext<Value, Parent> = InternalValidationContext<NonNullable<Value>, Parent>

