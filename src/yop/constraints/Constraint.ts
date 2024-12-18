import { Group, InternalValidationContext, ValidationContext } from "../ValidationContext"

export type ConstraintType<Value, ConstraintValue, Parent = unknown> = 
    ConstraintValue |
    ((context: ValidationContext<Value, Parent>) => ConstraintValue)

export type MessageType<Value, Parent = unknown> =
    string |
    undefined |
    ((context: ValidationContext<Value, Parent>) => string | undefined)

export type SingleConstraintTuple<Value, ConstraintValue, Parent = unknown> =
    readonly [ConstraintType<Value, ConstraintValue, Parent>, MessageType<Value, Parent>, Group?]

export type MultipleConstraintTuple<Value, ConstraintValue, Parent = unknown> =
    readonly [ConstraintType<Value, ConstraintValue, Parent>, MessageType<Value, Parent>, Group]

export type Constraint<Value, ConstraintValue, Parent = unknown> =
    ConstraintType<Value, ConstraintValue, Parent> |
    SingleConstraintTuple<Value, ConstraintValue, Parent> |
    [MultipleConstraintTuple<Value, ConstraintValue, Parent>, ...MultipleConstraintTuple<Value, ConstraintValue, Parent>[]]

export function validateConstraint<Value, ConstraintValue, Parent>(
    context: InternalValidationContext<Value | null | undefined, Parent>,
    constraint: Constraint<Value, ConstraintValue, Parent> | undefined,
    isConstraintValue: (value: any) => value is ConstraintValue,
    validate: (value: Value, constraintValue: NonNullable<ConstraintValue>) => boolean,
    errorCode: string,
    defaultConstraint?: Constraint<Value, ConstraintValue, Parent>
) {
    let message: MessageType<Value> | undefined = undefined

    if (constraint != null && !isConstraintValue(constraint)) {
        if (Array.isArray(constraint)) {
            const [maybeConstraint, maybeMessage, _maybeGroup] = constraint
            if (maybeConstraint == null || isConstraintValue(maybeConstraint)) {
                constraint = maybeConstraint
                message = maybeMessage as unknown as MessageType<Value> | undefined
            }
            else if (Array.isArray(maybeConstraint)) {
                // TODO: array of tuples with groups
            }
        }
    }

    if (typeof message === "function")
        message = (message as (context: any) => string)(context)
    
    if (constraint == null && defaultConstraint != null)
        constraint = defaultConstraint
    if (typeof constraint === "function")
        constraint = (constraint as (context: any) => ConstraintValue)(context)

    return (
        constraint == null ||
        validate(context.value as Value, constraint as NonNullable<ConstraintValue>) ||
        context.createError(errorCode, constraint, message) // false
    )
}
    