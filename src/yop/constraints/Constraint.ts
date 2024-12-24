import { isFunction } from "../TypesUtil"
import { Group, InternalValidationContext, Level, ValidationContext } from "../ValidationContext"

export type ConstraintMessage = string | (() => any)
export type ConstraintValue<ConstraintType> = ConstraintType | readonly [ConstraintType, ConstraintMessage, Level?, Group?]
export type ConstraintFunction<Value, ConstraintType, Parent = unknown> = ((context: ValidationContext<Value, Parent>) => ConstraintValue<ConstraintType>)

// export type MultipleConstraintTuple<Value, ConstraintValue, Parent = unknown> =
//     readonly [ConstraintType<Value, ConstraintValue, Parent>, MessageType<Value, Parent>, Level | undefined, Group]

export type Constraint<Value, ConstraintType, Parent = unknown> =
    ConstraintValue<ConstraintType> |
    ConstraintFunction<Value, ConstraintType, Parent>
    // [MultipleConstraintTuple<Value, ConstraintValue, Parent>, ...MultipleConstraintTuple<Value, ConstraintValue, Parent>[]]

export function validateConstraint<Value, ConstraintType, Parent>(
    context: InternalValidationContext<Value, Parent>,
    constraint: Constraint<Value, ConstraintType, Parent> | undefined,
    isConstraintType: (value: any) => value is ConstraintType,
    validate: (value: Value, constraintValue: NonNullable<ConstraintType>) => boolean,
    errorCode: string,
    defaultConstraint?: ConstraintType
) {
    let message: ConstraintMessage | undefined = undefined
    let level: Level = "error"

    if (isFunction(constraint))
        constraint = (constraint as ConstraintFunction<Value, ConstraintType>)(context)

    if (constraint != null && !isConstraintType(constraint)) {
        if (Array.isArray(constraint)) {
            const [maybeConstraint, maybeMessage, maybeLevel, _maybeGroup] = constraint
            if (maybeConstraint == null || isConstraintType(maybeConstraint)) {
                constraint = maybeConstraint
                message = maybeMessage
                level = (maybeLevel as unknown as Level) ?? "error"
            }
            else if (Array.isArray(maybeConstraint)) {
                // TODO: array of tuples with groups
            }
        }
        else {
            constraint = undefined
        }
    }
    
    if (constraint == null && defaultConstraint != null)
        constraint = defaultConstraint

    return (
        constraint == null ||
        validate(context.value as Value, constraint as NonNullable<ConstraintType>) ||
        context.createStatus(errorCode, constraint, message as string, level) // false
    )
}
