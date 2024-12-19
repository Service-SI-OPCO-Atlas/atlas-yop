import { MessageType } from "./Constraint"
import { Group, InternalValidationContext, ValidationContext } from "../ValidationContext"
import { isFunction } from "../types"

export interface TestValidationContext<Value, Parent> extends ValidationContext<Value, Parent> {
    createError(message: string, path?: string): false
}

export class InternalTestValidationContext<Value, Parent> extends InternalValidationContext<Value, Parent> implements TestValidationContext<Value, Parent> {

    constructor(context: InternalValidationContext<Value, Parent>) {
        super(context)
    }

    override createError(message: string, path?: string): false {
        return super.createError("test", false, message, path)
    }
}

export type TestConstraintType<Value, Parent = unknown> = ((context: TestValidationContext<Value, Parent>) => boolean)

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

    const valid = (constraint as (context: any) => boolean)(new InternalTestValidationContext(context))
    if (!valid && !context.errors.has(context.path))
        context.createError("test", false, message)
    return valid
}
