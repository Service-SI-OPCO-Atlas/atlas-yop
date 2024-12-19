import { CommonConstraints, validateCommonConstraints, validateTypeConstraint } from "../constraints/CommonConstraints"
import { OneOfConstraint, validateOneOfConstraint } from "../constraints/OneOfConstraint"
import { TestConstraint, validateTestConstraint } from "../constraints/TestConstraint"
import { isBoolean, isBooleanArray } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

export type BooleanValue = boolean | null | undefined

export interface BooleanConstraints<Value extends BooleanValue, Parent> extends
    CommonConstraints<Value, Parent>,
    OneOfConstraint<Value, Parent>,
    TestConstraint<Value, Parent> {
}

function validateBoolean<Value extends BooleanValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: BooleanConstraints<Value, Parent>) {
    return (
        validateCommonConstraints(context, constraints) &&
        validateTypeConstraint(context, isBoolean, "boolean") &&
        validateOneOfConstraint(context, constraints, isBooleanArray) &&
        validateTestConstraint(context, constraints)
    )
}

export function boolean<Value extends BooleanValue, Parent>(constraints?: BooleanConstraints<Value, Parent>) {
    return fieldValidationDecorator("boolean", constraints ?? {}, validateBoolean)
}
