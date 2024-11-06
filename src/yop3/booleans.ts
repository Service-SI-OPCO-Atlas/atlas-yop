import { Constraint } from "./Yop"

export type BooleanType = boolean | null | undefined

export type BooleanConstraints = {
    required?: Constraint<BooleanType, boolean>
}

export type BooleanSchema = readonly ["boolean", BooleanConstraints]
