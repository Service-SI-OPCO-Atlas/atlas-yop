import { isFunction } from "../types"
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

export type ConstraintValue<Value, ConstraintValue, Parent = unknown> =
    ConstraintType<Value, ConstraintValue, Parent> |
    SingleConstraintTuple<Value, ConstraintValue, Parent> |
    [MultipleConstraintTuple<Value, ConstraintValue, Parent>, ...MultipleConstraintTuple<Value, ConstraintValue, Parent>[]]

export function validateConstraint<Value, Constraint, Parent>(
    context: InternalValidationContext<Value | null | undefined, Parent>,
    constraint: ConstraintValue<Value, Constraint, Parent> | undefined,
    isConstraintValue: (value: any) => value is Constraint,
    validate: (value: Value, constraintValue: NonNullable<Constraint>) => boolean,
    errorCode: string,
    defaultConstraint?: ConstraintValue<Value, Constraint, Parent>
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

    if (isFunction(message))
        message = (message as (context: any) => string)(context)
    
    if (constraint == null && defaultConstraint != null)
        constraint = defaultConstraint
    if (isFunction(constraint))
        constraint = (constraint as (context: any) => Constraint)(context)

    return (
        constraint == null ||
        validate(context.value as Value, constraint as NonNullable<Constraint>) ||
        context.createError(errorCode, constraint, message) // false
    )
}
    