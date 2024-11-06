import { Constraint } from "./Yop"

export type NumberType = number | null | undefined

export type NumberConstraints = {
    required?: Constraint<NumberType, boolean>
    min?: Constraint<NumberType, number>
    max?: Constraint<NumberType, number>
}

export type NumberSchema = readonly ["number", NumberConstraints]
