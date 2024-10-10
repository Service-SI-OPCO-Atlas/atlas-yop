import { AnySchema, ConstraintsExecutor, ConstraintValue, deepFreeze, Message, OneOfConstraint } from "./AnySchema"

export class BooleanSchema<T extends boolean | null | undefined> extends AnySchema<T> {

    constructor(constraints?: ConstraintsExecutor<T>) {
        super('boolean', undefined, constraints ?? new ConstraintsExecutor<T>())
        deepFreeze(this)
    }

    protected clone(constraints: ConstraintsExecutor<T>) {
        return new BooleanSchema<T>(constraints) as this
    }

    oneOf<U extends T>(values: ConstraintValue<T, readonly U[]>, message?: Message) {
        return this.addConstraints(new OneOfConstraint<T>(values, message))
    }
}
