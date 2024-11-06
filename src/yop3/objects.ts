import { Constraint, SchemaFor } from "./Yop"

export type ObjectType = object | null | undefined

export type ObjectConstraints<T extends ObjectType> = undefined | {
    required?: Constraint<T, boolean>
}

export type ObjectSchema<T extends ObjectType = ObjectType> = readonly ["object", ObjectConstraints<T> | undefined, Partial<{ [P in keyof T]: SchemaFor<T[P]> }>]

