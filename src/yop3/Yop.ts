import { ArrayConstraints, ArraySchema, ArrayType } from "./arrays"
import { BooleanSchema, BooleanType } from "./booleans"
import { DateSchema, DateType } from "./dates"
import { FileSchema, FileType } from "./files"
import { NumberSchema, NumberType } from "./numbers"
import { ObjectConstraints, ObjectSchema, ObjectType } from "./objects"
import { EmailSchema, StringSchema, StringType, TimeSchema } from "./strings"

export type SchemaFor<T> = 
    [T] extends [StringType] ? StringSchema :
    [T] extends [NumberType] ? NumberSchema :
    [T] extends [BooleanType] ? BooleanSchema :
    [T] extends [DateType] ? DateSchema :
    [T] extends [FileType] ? FileSchema :
    [T] extends [ArrayType] ? ArraySchema<T> :
    [T] extends [ObjectType] ? ObjectSchema<T> :
    never

export class ValidationContext<ValueType, ParentType = any> {

    readonly schema: SchemaFor<ValueType>
    readonly value: ValueType
    readonly path: string | undefined
    readonly parent: ParentType | undefined
    readonly root: any | undefined
    readonly userContext: any | undefined
    readonly createError: ((message: string, path?: string) => boolean) | undefined
    readonly group: GroupType | undefined

    constructor(config: {
        schema: SchemaFor<ValueType>,
        value: ValueType,
        path?: string | undefined,
        parent?: ParentType | undefined,
        root?: any | undefined,
        userContext?: any | undefined,
        createError?: (message: string, path?: string) => boolean
        group?: GroupType
    }) {
        this.schema = config.schema
        this.value = config.value
        this.path = config.path
        this.parent = config.parent
        this.root = config.root
        this.userContext = config.userContext
        this.createError = config.createError
        this.group = config.group
    }

    matchGroup(group: GroupType | undefined) {
        if (group == null)
            return this.group == null || (Array.isArray(this.group) && this.group.includes(undefined))
        if (Array.isArray(group))
            return Array.isArray(this.group) ? group.some(g => (this.group as (string | undefined)[]).includes(g)) : group.includes(this.group)
        return (Array.isArray(this.group) ? this.group.includes(group) : this.group === group)
    }

    getRoot<T>() {
        return this.root as T
    }

    getUserContext<T>() {
        return this.userContext as T
    }
}

export type ConstraintType<ValueType, ConstraintValueType, ParentType = any> = 
    ConstraintValueType |
    ((context: ValidationContext<ValueType, ParentType>) => ConstraintValueType)
export type MessageType<ValueType, ParentType = any> =
    string |
    ((context: ValidationContext<ValueType, ParentType>) => string)
export type GroupType =
    string |
    ((string | undefined)[])

export type Constraint<ValueType, ConstraintValueType, ParentType = any> =
    ConstraintType<ValueType, ConstraintValueType, ParentType> |
    readonly [ConstraintType<ValueType, ConstraintValueType, ParentType>, MessageType<ValueType, ParentType>]
    // [ConstraintType<ValueType, ConstraintValueType>, MessageType<ValueType, ParentType>, GroupType][]

export type AnySchema =
    StringSchema |
    NumberSchema |
    BooleanSchema |
    DateSchema |
    FileSchema |
    ArraySchema |
    ObjectSchema

type ValidateParameter<Schema> =
    Schema extends StringSchema ? StringSchema :
    Schema extends EmailSchema ? EmailSchema :
    Schema extends TimeSchema ? TimeSchema :
    Schema extends NumberSchema ? NumberSchema :
    Schema extends BooleanSchema ? BooleanSchema :
    Schema extends DateSchema ? DateSchema :
    Schema extends FileSchema ? FileSchema :
    Schema extends readonly ["array", ArrayConstraints, infer ArrayItemSchema extends AnySchema] ?
        readonly ["array", ArrayConstraints, ValidateParameter<ArrayItemSchema>] :
    Schema extends readonly ["object", ObjectConstraints<infer ObjectShape extends ObjectType>, infer ObjectShape extends ObjectType] ?
        readonly ["object", ObjectConstraints<ObjectShape>, { [PropertyKey in keyof ObjectShape]: ValidateParameter<ObjectShape[PropertyKey]> }] :
    never

function resolveConstraint<ValueType, ConstraintValueType>(constraint: Constraint<ValueType, ConstraintValueType> | undefined, context: ValidationContext<ValueType>) {
    if (typeof constraint === 'function')
        return (constraint as ((context: ValidationContext<ValueType>) => ConstraintValueType))(context)
    // if (Array.isArray(constraint)) {
    //     if (constraint.length === 0)
    //         return undefined
    //     const isConstraintMessage = (typeof constraint?.[1] === 'string' || typeof constraint?.[1] === 'function')
    //     if (isConstraintMessage) {
    //         const [value, message] = constraint
    //         if (value)
    //             return value
    //         if (message)
    //             return message
    //     }
    // }
    return constraint as ConstraintValueType
}

function stringValidator(context: ValidationContext<StringType>) {
    const value = context.value
    const constraints = context.schema[1]
    if (resolveConstraint(constraints.required, context) === true && !value)
        return ["Champ obligatoire"]
    if (value != null) {
        if (typeof value !== 'string')
            return ["Bad type"]
        const min = resolveConstraint(constraints.min, context as ValidationContext<string>) as number
        if (min != null && value.length < min)
            return ["Min"]
        const max = resolveConstraint(constraints.max, context as ValidationContext<string>) as number
        if (max != null && value.length > max)
            return ["Max"]
        // const match = resolveConstraint(constraints.match, context)
        // if (match != null && !match.test(value))
        //     return ["Match"]
    }        
    return []
}

export function validate<const Schema extends AnySchema>(schema: Schema & ValidateParameter<Schema>, value: any, group?: GroupType) {
    const type = schema[0]

    const validator = ({
        "string": stringValidator,
    } as any)[type]

    return validator?.(new ValidationContext({ schema: schema as StringSchema, value, group }))
}

// validate(["object", { required: true }, {
//     name: ["string", {
//         required: true,
//         min: 5,
//         // max: 10,
//     }],
// }], {})

class Pet {
    age: number | null = null
}
class Person {
    name: string | null = null
    email: string | null = null
    pet: Pet | null = null
    pets: (Pet | null)[] | null = null
}

const petSchema: SchemaFor<Pet | null> = ["object", { required: true }, {
    age: ["number", { required: true }]
}]

const personSchema: SchemaFor<Person> = ["object", { required: true }, {
    name: ["string", {
        required: (context) => true,
        min: [5, "Minimum 5 characters"],
        // max: (context) => context.group?.includes("recap") ? 10 : 100,
        match: /^abc/,
    }],
    email: ["string", {
        required: true,
        min: 5,
        // max: 10,
    }],
    pet: petSchema,
    pets: ["array",, petSchema]
}]

// validate(personSchema, {})