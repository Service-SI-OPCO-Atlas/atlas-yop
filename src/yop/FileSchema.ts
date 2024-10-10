import { AnySchema, ConstraintsExecutor, ConstraintValue, deepFreeze, MaxConstraint, Message, MinConstraint, SchemaConstraints } from "./AnySchema"

class MinFileConstraint extends MinConstraint<File | null | undefined, File | number> {
    
    override accept(value: File, constraintValue: File | number) {
        return value.size >= (typeof constraintValue === "number" ? constraintValue : constraintValue.size)
    }
}

class MaxFileConstraint extends MaxConstraint<File | null | undefined, File | number> {
    
    override accept(value: File, constraintValue: File | number) {
        return value.size >= (typeof constraintValue === "number" ? constraintValue : constraintValue.size)
    }
}

export class FileSchema<T extends File | null | undefined> extends AnySchema<T> {

    constructor(constraints?: ConstraintsExecutor<T>) {
        super({ name: 'file', test: (value: any) => value instanceof File }, undefined, constraints ?? new ConstraintsExecutor<T>())
        deepFreeze(this)
    }

    protected clone(constraints: ConstraintsExecutor<T>) {
        return new FileSchema<T>(constraints) as this
    }

    min(value: ConstraintValue<T, File | number>, message?: Message) {
        return this.addConstraints(new MinFileConstraint(value as any, message))
    }

    max(value: ConstraintValue<T, File | number>, message?: Message) {
        return this.addConstraints(new MaxFileConstraint(value as any, message))
    }
}
