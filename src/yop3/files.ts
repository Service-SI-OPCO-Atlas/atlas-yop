import { Constraint } from "./Yop"

export type FileType = File | null | undefined

export type FileConstraints = {
    required?: Constraint<FileType, boolean>
}

export type FileSchema = readonly ["file", FileConstraints]
