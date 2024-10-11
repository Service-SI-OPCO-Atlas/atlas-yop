import { AnySchema, ConstraintsExecutor, ConstraintValue, deepFreeze, MaxConstraint, Message, MinConstraint, OneOfConstraint } from "./AnySchema"
class MinNumberConstraint extends MinConstraint<number | null | undefined, number> {
    
    override accept(value: number, constraintValue: number) {
        return value >= constraintValue
    }
}

class MaxNumberConstraint extends MaxConstraint<number | null | undefined, number> {
    
    override accept(value: number, constraintValue: number) {
        return value <= constraintValue
    }
}

export class NumberSchema<T extends number | null | undefined> extends AnySchema<T> {

    constructor(constraints?: ConstraintsExecutor<T>) {
        super('number', constraints ?? new ConstraintsExecutor<T>())
        deepFreeze(this)
    }

    protected clone(constraints: ConstraintsExecutor<T>) {
        return new NumberSchema<T>(constraints) as this
    }

    min(value: ConstraintValue<T, number>, message?: Message) {
        return this.addConstraints(new MinNumberConstraint(value as any, message))
    }

    max(value: ConstraintValue<T, number>, message?: Message) {
        return this.addConstraints(new MaxNumberConstraint(value as any, message))
    }

    oneOf<U extends T>(values: ConstraintValue<T, readonly U[]>, message?: Message) {
        return this.addConstraints(new OneOfConstraint<T>(values, message))
    }
}

