import { Constraint, validateConstraint } from "./Constraint"
import { isBoolean } from "../types"
import { ValidationContext } from "../ValidationContext"

export interface CommonConstraints<Field, Parent = unknown> {
    /**
     * If `true`, the property must be present in the parent object (ie: `"prop" in obj` is true).
     */
    exists?: Constraint<Field | null | undefined, boolean, Parent>
    /**
     * If `true`, the value must not be `undefined`.
     */
    defined?: Constraint<Field | null | undefined, boolean, Parent>
    /**
     * If `true`, the value must not be `null`.
     */
    notnull?: Constraint<Field | null | undefined, boolean, Parent>
    /**
     * If `true`, the the value must not be `undefined` or `null`.
     */
    required?: Constraint<Field | null | undefined, boolean, Parent>
}

export enum CommonCodes {
    exists = "exists",
    defined = "defined",
    notnull = "notnull",
    required = "required",
}

export function validateCommonConstraints<ValueType, Parent>(context: ValidationContext<ValueType, Parent>, constraints: CommonConstraints<ValueType, Parent>) {
    return (
        validateConstraint(context, constraints.defined, isBoolean, (value, constraint) => constraint !== true || value !== undefined, CommonCodes.defined) &&
        validateConstraint(context, constraints.notnull, isBoolean, (value, constraint) => constraint !== true || value !== null, CommonCodes.notnull) &&
        validateConstraint(context, constraints.required, isBoolean, (value, constraint) => constraint !== true || value != null, CommonCodes.required)
    )
}

export function validateValueType(context: ValidationContext<any>, checkType: (value: any) => boolean, expectedType: string) {
    return context.value != null && (checkType(context.value) || context.createError("type", expectedType))
}
