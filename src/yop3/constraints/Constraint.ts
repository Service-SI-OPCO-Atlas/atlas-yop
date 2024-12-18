import { GroupType, InternalValidationContext } from "../ValidationContext"

type ConstraintType<ValueType, ConstraintValueType, ParentType = unknown> = 
    ConstraintValueType |
    ((context: InternalValidationContext<ValueType, ParentType>) => ConstraintValueType)

export type MessageType<ValueType, ParentType = unknown> =
    string |
    undefined |
    ((context: InternalValidationContext<ValueType, ParentType>) => string | undefined)

type SingleConstraintTuple<ValueType, ConstraintValueType, ParentType = unknown> =
    readonly [ConstraintType<ValueType, ConstraintValueType, ParentType>, MessageType<ValueType, ParentType>, GroupType?]

type MultipleConstraintTuple<ValueType, ConstraintValueType, ParentType = unknown> =
    readonly [ConstraintType<ValueType, ConstraintValueType, ParentType>, MessageType<ValueType, ParentType>, GroupType]

export type Constraint<ValueType, ConstraintValueType, ParentType = unknown> =
    ConstraintType<ValueType, ConstraintValueType, ParentType> |
    SingleConstraintTuple<ValueType, ConstraintValueType, ParentType> |
    [MultipleConstraintTuple<ValueType, ConstraintValueType, ParentType>, ...MultipleConstraintTuple<ValueType, ConstraintValueType, ParentType>[]]

export function validateConstraint<ValueType, ConstraintValueType, Parent>(
    context: InternalValidationContext<ValueType | null | undefined, Parent>,
    constraint: Constraint<ValueType, ConstraintValueType, Parent> | undefined,
    isConstraintValue: (value: any) => value is ConstraintValueType,
    validate: (value: ValueType, constraintValue: NonNullable<ConstraintValueType>) => boolean,
    errorCode: string,
    defaultConstraint?: Constraint<ValueType, ConstraintValueType, Parent>
) {
    const _context = context as InternalValidationContext<ValueType>

    let message: MessageType<ValueType> | undefined = undefined

    if (constraint != null && !isConstraintValue(constraint)) {
        if (Array.isArray(constraint)) {
            const [maybeConstraint, maybeMessage, _maybeGroup] = constraint
            if (maybeConstraint == null || isConstraintValue(maybeConstraint)) {
                constraint = maybeConstraint
                message = maybeMessage as unknown as MessageType<ValueType> | undefined
            }
            else if (Array.isArray(maybeConstraint)) {
                // TODO: array of tuples with groups
            }
        }
    }

    if (typeof message === "function")
        message = (message as ((context: InternalValidationContext<ValueType>) => string))(_context)
    
    if (constraint == null && defaultConstraint != null)
        constraint = defaultConstraint
    if (typeof constraint === "function")
        constraint = (constraint as ((context: InternalValidationContext<ValueType>) => ConstraintValueType))(_context)

    return (
        constraint == null ||
        validate(_context.value, constraint as NonNullable<ConstraintValueType>) ||
        context.createError(errorCode, constraint, message) // false
    )
}
    