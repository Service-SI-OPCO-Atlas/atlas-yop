import { MessageType } from "./Constraint"
import { Group, InternalValidationContext, ValidationContext } from "../ValidationContext"
import { isFunction } from "../TypesUtil"

export type TestConstraintType<Value, Parent = unknown> = ((context: ValidationContext<Value, Parent>) => string | boolean | undefined)

export type SingleTestConstraintTuple<Value, Parent = unknown> =
    readonly [TestConstraintType<Value, Parent>, MessageType<Value, Parent>, Group?]

export type MultipleTestConstraintTuple<Value, Parent = unknown> =
    readonly [TestConstraintType<Value, Parent>, MessageType<Value, Parent>, Group]

export type TestConstraintValue<Value, Parent = unknown> =
    TestConstraintType<Value, Parent> |
    SingleTestConstraintTuple<Value, Parent> |
    [MultipleTestConstraintTuple<Value, Parent>, ...MultipleTestConstraintTuple<Value, Parent>[]]


export interface TestConstraint<Value, Parent = unknown> {
    test?: TestConstraintValue<NonNullable<Value>, Parent>
}

export function validateTestConstraint<Value, Parent>(context: InternalValidationContext<Value, Parent>, constraints: TestConstraint<NonNullable<Value>, Parent>) {
    let message: MessageType<Value> | undefined = undefined
    let constraint = constraints.test

    if (constraint != null && !isFunction(constraint)) {
        if (Array.isArray(constraint)) {
            const [maybeConstraint, maybeMessage, _maybeGroup] = constraint
            if (maybeConstraint == null || isFunction(maybeConstraint)) {
                constraint = maybeConstraint
                message = maybeMessage as unknown as MessageType<Value> | undefined
            }
            else if (Array.isArray(maybeConstraint)) {
                // TODO: array of tuples with groups
            }
        }
    }
    
    if (!isFunction(constraint))
        return true

    if (isFunction(message))
        message = message(context)

    const result = (constraint as TestConstraintType<Value, Parent>)(context)
    return result == null || result === true || context.createError("test", false, result === false ? message : result)
}
