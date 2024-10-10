import { describe, it, expect } from 'vitest'

type ValidationContext<FieldType>  = {
    // userContext?: C
    // schema: SchemaForType<T>
    // root?: R
    // parent?: P
    path?: string
    value: FieldType
}

type ValidationError = {
    path?: string
    value: any
    code: string
    message: string
}

export type Message<FieldType> = string | ((context: ValidationContext<FieldType>) => string)


abstract class Constraint<FieldType> {

    constructor(
        readonly priority: number,
        readonly multiple: boolean,
        readonly acceptNull = false
    ) {}

    abstract validate(context: ValidationContext<FieldType>): ValidationError[] | undefined
}

class IgnoredConstraint extends Constraint<any> {

    constructor() {
        super(0, false, true)
    }

    validate(context: ValidationContext<any>): ValidationError[] | undefined {
        return []
    }
}

function createMessage<FieldType>(context: ValidationContext<FieldType>, message?: Message<FieldType>) {
    return message == null ? 'This field is required' : typeof message === 'string' ? message : message(context)
}

class DefinedConstraint<FieldType> extends Constraint<FieldType> {

    constructor(readonly value = true, readonly message?: Message<FieldType>) {
        super(1, false, true)
    }

    validate(context: ValidationContext<FieldType>): ValidationError[] | undefined {
        if (this.value !== true || context.value !== undefined)
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'required',
            message: createMessage<FieldType>(context, this.message)
        }]
    }
}

class RequiredConstraint<FieldType> extends Constraint<FieldType> {

    constructor(readonly value = true, readonly message?: Message<FieldType>) {
        super(2, false, true)
    }

    validate(context: ValidationContext<FieldType>): ValidationError[] | undefined {
        if (this.value !== true || context.value != null)
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'required',
            message: createMessage<FieldType>(context, this.message)
        }]
    }
}

class StringRequiredConstraint extends RequiredConstraint<string | null | undefined> {

    constructor(value = true, message?: Message<string | null | undefined>) {
        super(value, message)
    }

    validate(context: ValidationContext<string | null | undefined>): ValidationError[] | undefined {
        if (this.value !== true || context.value)
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'required',
            message: createMessage<string | null | undefined>(context, this.message)
        }]
    }
}

class StringMinConstraint extends Constraint<string> {

    constructor(readonly value: number, readonly message?: Message<string>) {
        super(3, false)
    }

    validate(context: ValidationContext<string>): ValidationError[] | undefined {
        if (!context.value || context.value.length >= this.value)
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'min',
            message: createMessage<string>(context, this.message)
        }]
    }
}

class StringMaxConstraint extends Constraint<string> {

    constructor(readonly value: number, readonly message?: Message<string>) {
        super(4, false)
    }

    validate(context: ValidationContext<string>): ValidationError[] | undefined {
        if (!context.value || context.value.length >= this.value)
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'min',
            message: createMessage<string>(context, this.message)
        }]
        
    }
}

class TestConstraint<FieldType> extends Constraint<NonNullable<FieldType>> {

    constructor(readonly value: ((context: ValidationContext<NonNullable<FieldType>>) => boolean), readonly message?: Message<FieldType>) {
        super(10, true)
    }

    validate(context: ValidationContext<NonNullable<FieldType>>): ValidationError[] | undefined {
        if (context.value == null || this.value(context))
            return undefined
        return [{
            path: context.path,
            value: context.value,
            code: 'test',
            message: createMessage<FieldType>(context, this.message)
        }]
    }
}

class Constraints<FieldType> {

    constraints: Constraint<FieldType>[] = []

    add(constraint: Constraint<FieldType>, clear = false) {
        if (clear && constraint.multiple)
            this.constraints = this.constraints.filter(c => c instanceof constraint.constructor === false)
        
        if (constraint.multiple)
            this.constraints.push(constraint)
        else {
            const index = this.constraints.findIndex(c => c instanceof constraint.constructor)
            if (index >= 0)
                this.constraints[index] = constraint
            else
                this.constraints.push(constraint)
        }
        
        this.constraints.sort((a, b) => a.priority - b.priority)
    }

    validate(context: ValidationContext<FieldType>): ValidationError[] {
        const nullishValue = context.value == null
        for (const constraint of this.constraints) {
            if (constraint.acceptNull === false && nullishValue)
                continue
            const errors = constraint.validate(context)
            if (errors != null)
                return errors
        }
        return []
    }
}

describe('test.yop', () => {
    describe('test.string', () => {

        it('constraints.order', () => {

            const constraints: Constraints<any> = new Constraints()
            constraints.add(new RequiredConstraint<any>())
            constraints.add(new IgnoredConstraint())
            
            expect(constraints.constraints[0] instanceof IgnoredConstraint).toBe(true)
            expect(constraints.constraints[1] instanceof RequiredConstraint).toBe(true)
        })

        it('constraints.validate', () => {

            const constraints: Constraints<string | null | undefined> = new Constraints()
            constraints.add(new DefinedConstraint<string | null | undefined>())
            
            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })).toEqual([])
            expect(constraints.validate({ value: undefined })?.[0]?.code).toEqual("required")

            constraints.add(new RequiredConstraint<string | null | undefined>())

            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })?.[0]?.code).toEqual("required")
            expect(constraints.validate({ value: undefined })?.[0]?.code).toEqual("required")

            constraints.add(new IgnoredConstraint())
            
            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })).toEqual([])
            expect(constraints.validate({ value: undefined })).toEqual([])
        })

        it('constraints.minmax', () => {

            const constraints: Constraints<string | null | undefined> = new Constraints()
            constraints.add(new StringMinConstraint(3))
            
            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })).toEqual([])
            expect(constraints.validate({ value: undefined })).toEqual([])
            expect(constraints.validate({ value: "" })).toEqual([])
            expect(constraints.validate({ value: "a" })?.[0]?.code).toEqual("min")
            expect(constraints.validate({ value: "ab" })?.[0]?.code).toEqual("min")
            expect(constraints.validate({ value: "abc" })).toEqual([])
            
            constraints.add(new StringMinConstraint(2))
            
            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })).toEqual([])
            expect(constraints.validate({ value: undefined })).toEqual([])
            expect(constraints.validate({ value: "" })).toEqual([])
            expect(constraints.validate({ value: "a" })?.[0]?.code).toEqual("min")
            expect(constraints.validate({ value: "ab" })).toEqual([])
            expect(constraints.validate({ value: "abc" })).toEqual([])

            constraints.add(new StringRequiredConstraint())
            
            expect(constraints.validate({ value: "hello" })).toEqual([])
            expect(constraints.validate({ value: null })?.[0]?.code).toEqual("required")
            expect(constraints.validate({ value: undefined })?.[0]?.code).toEqual("required")
            expect(constraints.validate({ value: "" })?.[0]?.code).toEqual("required")
            expect(constraints.validate({ value: "a" })?.[0]?.code).toEqual("min")
            expect(constraints.validate({ value: "ab" })).toEqual([])
            expect(constraints.validate({ value: "abc" })).toEqual([])

            constraints.add(new TestConstraint(context => context.value.startsWith("abc"), "Value must start with abc"))

            //expect(constraints.validate({ value: null })).toEqual([])
            expect(constraints.validate({ value: "abc" })).toEqual([])
            expect(constraints.validate({ value: "abcd" })).toEqual([])
            expect(constraints.validate({ value: "efg" })?.[0]?.code).toEqual("test")

            constraints.add(new TestConstraint(context => context.value.endsWith("def"), "Value must be abc"))

            expect(constraints.validate({ value: "abcdef" })).toEqual([])
            expect(constraints.validate({ value: "abcd" })?.[0]?.code).toEqual("test")

            constraints.add(new TestConstraint(context => context.value.endsWith("def"), "Value must be abc"), true)

            expect(constraints.validate({ value: "def" })).toEqual([])
        })
    })
})
