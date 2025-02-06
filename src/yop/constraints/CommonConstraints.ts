import { Constraint, validateConstraint } from "./Constraint"
import { isBoolean } from "../TypesUtil"
import { InternalValidationContext } from "../ValidationContext"

export interface CommonConstraints<Value, Parent = unknown> {
    /**
     * If `true`, the property must be present in the parent object (ie: `"prop" in obj` is true).
     */
    exists?: Constraint<Value | null | undefined, boolean, Parent>
    /**
     * If `true`, the value must not be `undefined`.
     */
    defined?: Constraint<Value | null | undefined, boolean, Parent>
    /**
     * If `true`, the value must not be `null`.
     */
    notnull?: Constraint<Value | null | undefined, boolean, Parent>
    /**
     * If `true`, the the value must not be `undefined` or `null`.
     */
    required?: Constraint<Value | null | undefined, boolean, Parent>
}

export type ContraintsValue<Contraints> = Contraints extends CommonConstraints<infer Value, infer _Parent> ? Value : never
export type ContraintsParent<Contraints> = Contraints extends CommonConstraints<infer _Value, infer Parent> ? Parent : never

export type Validator<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>> =
    (context: InternalValidationContext<Value, Parent>, constraints: Constraints) => boolean

export type Traverser<Constraints, Value = ContraintsValue<Constraints>, Parent = ContraintsParent<Constraints>> =
    ((context: InternalValidationContext<Value, Parent>, constraints: Constraints, propertyOrIndex: string | number, traverseNullish?: boolean) =>
    readonly [InternalCommonConstraints | undefined, InternalValidationContext<unknown>])

export interface InternalConstraints {
    /**
     * The kind of the decorated value (eg: `string`, `number`, etc.)
     */
    kind: string
    /**
     * The method that validates the decorated value.
     */
    validate: Validator<this>
    /**
     * The method that returns the constraints and value of a nested field.
     */
    traverse?: Traverser<this>

    groups?: Record<string, this>
}
    

export interface InternalCommonConstraints extends CommonConstraints<unknown>, InternalConstraints {
}

export function validateCommonConstraints<Value, Parent>(context: InternalValidationContext<Value, Parent>, constraints: CommonConstraints<Value, Parent>) {
    return (
        validateConstraint(context, constraints, "defined", isBoolean, (value, constraint) => constraint !== true || value !== undefined) &&
        validateConstraint(context, constraints, "notnull", isBoolean, (value, constraint) => constraint !== true || value !== null) &&
        validateConstraint(context, constraints, "required", isBoolean, (value, constraint) => constraint !== true || value != null)
    )
}

export function validateTypeConstraint(context: InternalValidationContext<any>, checkType: (value: any) => boolean, expectedType: string) {
    return checkType(context.value) || context.setStatus("type", expectedType) == null
}
