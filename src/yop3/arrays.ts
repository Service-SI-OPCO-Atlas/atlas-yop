import { Constraint, SchemaFor } from "./Yop"

export type ArrayType = any[] | null | undefined
export type ArrayItemType<ArrayType> = ArrayType extends Array<infer ItemType> ? ItemType : never


export type ArrayConstraints = undefined | {
    required?: Constraint<ArrayType, boolean>
    min?: Constraint<ArrayType, number>
    max?: Constraint<ArrayType, number>
}

export type ArraySchema<T extends ArrayType = ArrayType> = readonly ["array", ArrayConstraints | undefined, SchemaFor<ArrayItemType<T>>]
