import { describe, expect, it } from "vitest"
import { string } from "../src/yop/decorators/string"
import { Yop } from "../src/yop/Yop"

describe("test.yop", () => {

    describe("test.string", () => {

        it("string", () => {

            expect(Yop.validateValue(undefined, string({ exists: true }))).toBeUndefined()
            expect(Yop.validateValue(undefined, string({ defined: true }))).toEqual({
                path: undefined,
                value: undefined,
                kind: "string",
                code: "defined",
                constraint: true,
                message: "Required field"
            })
            expect(Yop.validateValue(undefined, string({ notnull: true }))).toBeUndefined()
            expect(Yop.validateValue(undefined, string({ required: true }))).toEqual({
                path: undefined,
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            })
            expect(Yop.validateValue(undefined, string({ min: 1, max: 1, oneOf: [], match: /\d+/, test: _ => false }))).toBeUndefined()
            
            expect(Yop.validateValue(null, string({ exists: true }))).toBeUndefined()
            expect(Yop.validateValue(null, string({ defined: true }))).toBeUndefined()
            expect(Yop.validateValue(null, string({ notnull: true }))).toEqual({
                path: undefined,
                value: null,
                kind: "string",
                code: "notnull",
                constraint: true,
                message: "Required field"
            })
            expect(Yop.validateValue(null, string({ required: true }))).toEqual({
                path: undefined,
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            })
            expect(Yop.validateValue(null, string({ min: 1, max: 1, oneOf: [], match: /\d+/, test: _ => false }))).toBeUndefined()
            
            expect(Yop.validateValue("", string({ exists: true }))).toBeUndefined()
            expect(Yop.validateValue("", string({ defined: true }))).toBeUndefined()
            expect(Yop.validateValue("", string({ notnull: true }))).toBeUndefined()
            expect(Yop.validateValue("", string({ required: true }))).toBeUndefined()
            expect(Yop.validateValue("", string({ min: 0 }))).toBeUndefined()
            expect(Yop.validateValue("", string({ min: 1 }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            })
            expect(Yop.validateValue("", string({ min: 2 }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "min",
                constraint: 2,
                message: "Minimum 2 characters"
            })
            expect(Yop.validateValue("", string({ match: /\d*/ }))).toBeUndefined()
            expect(Yop.validateValue("", string({ match: /\d+/ }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Invalid format"
            })
            expect(Yop.validateValue("", string({ oneOf: [] }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: [],
                message: "Must be one of: "
            })
            expect(Yop.validateValue("", string({ oneOf: [""] }))).toBeUndefined()
            expect(Yop.validateValue("", string({ oneOf: ["", "bla"] }))).toBeUndefined()
            expect(Yop.validateValue("", string({ oneOf: ["bla", "blo", "bli"] }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["bla", "blo", "bli"],
                message: "Must be one of: bla, blo, or bli"
            })
            expect(Yop.validateValue("", string({ test: context => context.value === "" }))).toBeUndefined()
            expect(Yop.validateValue("", string({ test: context => context.value === "blah" }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Invalid value"
            })

            Yop.setLocale("fr-FR")
            expect(Yop.validateValue("", string({ min: 1 }))).toEqual({
                "code": "min",
                "constraint": 1,
                "kind": "string",
                "message": "Minimum 1 caractère",
                "path": undefined,
                "value": "",
            })
            expect(Yop.validateValue("", string({ oneOf: ["bla", "blo", "bli"] }))).toEqual({
                path: undefined,
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["bla", "blo", "bli"],
                message: "Doit être parmi : bla, blo ou bli"
            })

        //     class Pet {
        //         @string({ required: true, min: 1 })
        //         name: string | null = null
        //     }
            
        //     class Dog extends Pet {
        //         @string({ required: true, min: 2 })
        //         food: string | null = null
        //     }

        //     @type({ id: "Person" })
        //     class Person {

        //         @string({ exists: true })
        //         dummy: string | null = null

        //         @string({
        //             required: context => context.parent.email != null,
        //             min: 2,
        //             max: 20,
        //             match: /^[a-zA-Z_]+$/
        //         })
        //         firstName: string | null = null
                
        //         @string({
        //             required: context => context.parent.firstName != null,
        //             // min: [2, "Le nom de famille doit avoir au moins un caratère"],
        //             min: [2, context => context.parent.firstName != null ? "Le nom de famille doit avoir au moins un caratère lorsque le prénom est renseigné" : undefined],
        //             test: context => context.value === "fuck" || context.createError("Should be "fuck""),
        //         })
        //         lastName: string | null = null
                
        //         @email({ required: true, match: [, "Invalid email"] })                
        //         email: string | null = null
                
        //         @number({ required: false, min: _context => 18, max: 100 })                
        //         age: number | null = null

        //         @boolean({ required: true, oneOf: [[true], "Doit être vrai"] })
        //         female: boolean | null = null

        //         @string({ required: true, oneOf: ["male", "female"] })
        //         gender: "male" | "female" | "other" | null = null

        //         @date({ required: true, min: new Date(1900, 0, 1) })
        //         birthDate: Date | null = null

        //         @array({ of: Dog, required: _context => true })
        //         pets: Pet[] = null as any

        //         @array({
        //             required: true,
        //             min: 2,
        //             of: string({ required: true, min: 2, max: 20 }),
        //         })
        //         names: string[] = null as any

        //         @instance({
        //             of: "Person",
        //             required: true,
        //         })
        //         friend: Person | null = null

        //         @array({
        //             required: true,
        //             of: instance({ of: "Person", required: true })
        //         })
        //         friends: Person[] = null as any

        //         @file({ required: true })
        //         doc: File | null = null
        //     }

        //     console.log("validate", Yop.validate(Person, {
        //         dummy: undefined,
        //         firstName: "12345678901234567890",
        //         lastName: "azerty",
        //         email: "test",
        //         female: false,
        //         gender: "other",
        //         age: 12,
        //         birthDate: new Date(1899, 0, 1),
        //         friend: null, //new Person(),
        //         pets: [{ name: "a", food: "b" }],
        //         names: ["ab", null, "c"],
        //         friends: [{ firstName: "a", lastName: "b" }, null]
        //     }))
        })
    })
})