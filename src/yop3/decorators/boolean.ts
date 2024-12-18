import { CommonConstraints, validateCommonConstraints, validateValueType } from "../constraints/CommonConstraints"
import { Constraint, validateConstraint } from "../constraints/Constraint"
import { isBoolean, isBooleanArray } from "../types"
import { InternalValidationContext } from "../ValidationContext"
import { fieldValidationDecorator } from "../Yop"

type BooleanValue = boolean | null | undefined

interface BooleanConstraints<Value extends BooleanValue, Parent> extends CommonConstraints<Value, Parent> {
    readonly oneOf?: Constraint<NonNullable<Value>, NoInfer<NonNullable<Value>>[], Parent>
}

function validateBoolean<Value extends BooleanValue, Parent>(context: InternalValidationContext<Value, Parent>, constraints: BooleanConstraints<Value, Parent>) {
    validateCommonConstraints(context, constraints) &&
    validateValueType(context, isBoolean, "boolean") &&
    validateConstraint(context, constraints.oneOf, isBooleanArray, (value, constraint) => constraint.includes(value), "oneOf")
}

export function boolean<Value extends BooleanValue, Parent>(constraints: BooleanConstraints<Value, Parent>) {
    return fieldValidationDecorator("boolean", constraints, validateBoolean)
}
