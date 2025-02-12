import { ConstraintMessage } from "./constraints/Constraint"
import { joinPath } from "./PathUtil"
import { ValidationSettings, Yop } from "./Yop"

export type Group = string | ((string | undefined)[])
export type Level = "info" | "warning" | "error" | "pending" | "unavailable"

export type ValidationStatus = {
    level: Level
    path: string
    value: any
    kind: string
    code: string
    constraint: any
    message: ConstraintMessage
}

export interface ValidationContext<Value, Parent = unknown> {
    
    readonly kind: string

    readonly value: Value
    readonly path: (string | number)[]

    readonly parent: Parent
    readonly parentContext: ValidationContext<Parent> | undefined

    getRoot<T>(): T | undefined
    readonly rootContext: ValidationContext<unknown> | undefined

    readonly settings: ValidationSettings | undefined
}

export const UndefinedParent = Object.freeze(Object.create(null))

export class InternalValidationContext<Value, Parent = unknown> implements ValidationContext<Value, Parent> {

    readonly yop: Yop

    readonly kind: string

    readonly value: Value
    readonly path: (string | number)[]

    readonly parentContext: InternalValidationContext<Parent> | undefined
    readonly rootContext: InternalValidationContext<unknown> | undefined

    readonly settings: ValidationSettings | undefined

    readonly statuses: Map<string, ValidationStatus>

    constructor(props: {
        yop: Yop
        kind: string
        value: Value
        key?: string | number | undefined
        parentContext?: InternalValidationContext<Parent> | undefined
        rootContext?: InternalValidationContext<unknown> | undefined
        userContext?: unknown | undefined
        statuses?: Map<string, ValidationStatus>
        settings?: ValidationSettings
    }) {
        if (props.parentContext != null && props.key == null)
            throw new Error("key must be provided when parentContext is provided")

        this.yop = props.yop
        this.kind = props.kind
        this.value = props.value
        this.parentContext = props.parentContext
        this.rootContext = props.rootContext
        this.settings = props.settings
        this.statuses = props.statuses ?? new Map()

        this.path = props.key == null ? [] : (props.parentContext?.path.concat(props.key) ?? [props.key])
    }

    ignored() {
        return this.settings?.ignore?.(this.path) ?? false
    }

    get parent() {
        return this.parentContext?.value || UndefinedParent as Parent
    }

    get groups() {
        return this.settings?.groups
    }

    getRoot<T>() {
        return this.rootContext?.value as T | undefined
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
            settings: this.settings,
            statuses: this.statuses
        })
    }

    createStatus(code: string, constraint: any, message?: ConstraintMessage, level: Level = "error"): ValidationStatus {
        return {
            level,
            path: joinPath(this.path),
            value: this.value,
            kind: this.kind,
            code,
            constraint,
            message: this.yop.messageProvider.getMessage(this, code, constraint, message, level),
        }
    }

    setStatus(code: string, constraint: any, message?: ConstraintMessage, level: Level = "error"): ValidationStatus {
        const status = this.createStatus(code, constraint, message, level)
        this.statuses.set(status.path, status)
        return status
    }
}

export type ValuedContext<Value, Parent> = InternalValidationContext<NonNullable<Value>, Parent>

