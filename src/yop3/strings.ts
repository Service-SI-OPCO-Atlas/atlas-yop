import { Constraint } from "./Yop"

export type StringType = string | null | undefined

// type BaseStringConstraints<MinMaxType> = {
//     required?: Constraint<string | null | undefined, boolean>
//     min?: Constraint<string, MinMaxType>
//     max?: Constraint<string, MinMaxType>
// }

export type StringConstraints = {
    required?: Constraint<StringType, boolean>
    min?: Constraint<StringType, number>
    max?: Constraint<StringType, number>
    match?: Constraint<StringType, RegExp>
}

export type EmailConstraints = {
    required?: Constraint<StringType, boolean>
    min?: Constraint<StringType, number>
    max?: Constraint<StringType, number>
}

export type TimeConstraints = {
    required?: Constraint<StringType, boolean>
    min?: Constraint<StringType, string>
    max?: Constraint<StringType, string>
}

export type StringSchema = readonly ["string", StringConstraints]
export type EmailSchema = readonly ["email", EmailConstraints]
export type TimeSchema = readonly ["time", TimeConstraints]
