import { AnySchema, ConstraintsExecutor, ConstraintValue, deepFreeze, MaxConstraint, Message, MinConstraint } from "./AnySchema"

class MinDateConstraint extends MinConstraint<Date | null | undefined, Date> {
    
    override accept(value: Date, constraintValue: Date) {
        return value.getTime() >= constraintValue.getTime()
    }
}

class MaxDateConstraint extends MaxConstraint<Date | null | undefined, Date> {
    
    override accept(value: Date, constraintValue: Date) {
        return value.getTime() <= constraintValue.getTime()
    }
}

export class DateSchema<T extends Date | null | undefined> extends AnySchema<T> {

    constructor(constraints?: ConstraintsExecutor<T>) {
        super({ name: 'date', test: (value: any) => value instanceof Date }, constraints ?? new ConstraintsExecutor<T>())
        deepFreeze(this)
    }

    protected clone(constraints: ConstraintsExecutor<T>) {
        return new DateSchema<T>(constraints) as this
    }

    min(value: ConstraintValue<T, Date>, message?: Message) {
        return this.addConstraints(new MinDateConstraint(value as any, message))
    }

    max(value: ConstraintValue<T, Date>, message?: Message) {
        return this.addConstraints(new MaxDateConstraint(value as any, message))
    }
}
