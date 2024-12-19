import { CommonConstraints, validateCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMinMaxConstraints } from "../constraints/MinMaxConstraints"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { isFile, isNumber } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type FileValue = File | null | undefined

export interface FileConstraints<Value extends FileValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    TestConstraint<Value, Parent> {
}

function validateFile<Value extends FileValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: FileConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateTypeConstraint(context, isFile, "date") &&
        validateMinMaxConstraints(context, constraints, isNumber, (value, min) => value.size >= min, (value, max) => value.size <= max) &&
        validateTestConstraint(context, constraints)
    )
}

export function file<Value extends FileValue, Parent>(constraints: FileConstraints<Value, Parent>) {
    return fieldValidationDecorator("file", constraints, validateFile)
}
