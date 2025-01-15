import { isFunction } from "../TypesUtil"
import { InternalValidationContext, Level, ValidationContext } from "../ValidationContext"

export type ConstraintMessage = string
export type ConstraintValue<ConstraintType> = ConstraintType | readonly [ConstraintType, ConstraintMessage, Level?]
export type ConstraintFunction<Value, ConstraintType, Parent = unknown> = ((context: ValidationContext<Value, Parent>) => ConstraintValue<ConstraintType>)

export type Constraint<Value, ConstraintType, Parent = unknown> =
    ConstraintValue<ConstraintType> |
    ConstraintFunction<Value, ConstraintType, Parent>

export function validateConstraint<Value, ConstraintType, Parent, Constraints = { [name: string]: Constraint<Value, ConstraintType, Parent> }>(
    context: InternalValidationContext<Value, Parent>,
    constraints: Constraints,
    name: keyof Constraints,
    isConstraintType: (value: any) => value is ConstraintType,
    validate: (value: Value, constraintValue: NonNullable<ConstraintType>) => boolean,
    defaultConstraint?: ConstraintType
) {
    if (context.groups == null)
        return _validateConstraint(context, constraints[name] as Constraint<Value, ConstraintType, Parent> | undefined, isConstraintType, validate, name as string, defaultConstraint)
    
    const groups = Array.isArray(context.groups) ? context.groups : [context.groups]
    for (const group of groups) {
        const constraint = (group == null ? constraints[name] : (constraints as any).groups?.[group]?.[name]) as Constraint<Value, ConstraintType, Parent> | undefined
        if (!_validateConstraint(context, constraint, isConstraintType, validate, name as string, defaultConstraint))
            return false
    }
    return true
}

function _validateConstraint<Value, ConstraintType, Parent>(
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
            else
                constraint = undefined
        }
        else
            constraint = undefined
    }
    
    if (constraint == null && defaultConstraint != null)
        constraint = defaultConstraint

    return (
        constraint == null ||
        validate(context.value as Value, constraint as NonNullable<ConstraintType>) ||
        context.setStatus(errorCode, constraint, message, level) == null
    )
}
