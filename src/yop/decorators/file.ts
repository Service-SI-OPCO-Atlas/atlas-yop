import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { MinMaxConstraints, validateMaxConstraint, validateMinConstraint } from "../constraints/MinMaxConstraints"
import { TestConstraints, validateTestConstraint } from "../constraints/TestConstraints"
import { isFile, isNumber } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type FileValue = File | null | undefined

export interface FileConstraints<Value extends FileValue, Parent> extends
    CommonConstraints<Value, Parent>,
    MinMaxConstraints<Value, number, Parent>,
    TestConstraints<Value, Parent> {}

function validateFile<Value extends FileValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: FileConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateValueType(context, isFile, "date") &&
        validateMinConstraint(context, constraints, isNumber, (value, constraint) => value.size >= constraint) &&
        validateMaxConstraint(context, constraints, isNumber, (value, constraint) => value.size <= constraint) &&
        validateTestConstraint(context, constraints)
    )
}

export function file<Value extends FileValue, Parent>(constraints: FileConstraints<Value, Parent>) {
    return fieldValidationDecorator("file", constraints, validateFile)
}
