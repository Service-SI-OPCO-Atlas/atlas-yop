import { Constraint } from "./Yop"

export type DateType = Date | null | undefined

export type DateConstraints = {
    required?: Constraint<DateType, boolean>
}

export type DateSchema = readonly ["date", DateConstraints]
