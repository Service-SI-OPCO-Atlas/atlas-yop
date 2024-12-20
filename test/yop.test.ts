import { describe, expect, it } from "vitest"
import { string } from "../src/yop/decorators/string"
import { Yop } from "../src/yop/Yop"
import { array, boolean, classId, date, email, emailRegex, file, instance, number } from "../src"

describe("yop", () => {

    describe("yop.string", () => {

        it("yop.string.undefined", () => {
            expect(Yop.validate(undefined, string({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, string({ defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "string",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, string({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, string({ required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, string({ min: 1, max: 1, oneOf: [], match: /\d+/, test: _ => false }))).toEqual([])
        })

        it("yop.string.null", () => {
            expect(Yop.validate(null, string({ exists: true }))).toEqual([])
            expect(Yop.validate(null, string({ defined: true }))).toEqual([])
            expect(Yop.validate(null, string({ notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "string",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, string({ required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, string({ min: 1, max: 1, oneOf: [], match: /\d+/, test: _ => false }))).toEqual([])
        })

        it("yop.string.empty", () => {
            expect(Yop.validate("", string({ exists: true }))).toEqual([])
            expect(Yop.validate("", string({ defined: true }))).toEqual([])
            expect(Yop.validate("", string({ notnull: true }))).toEqual([])
            expect(Yop.validate("", string({ required: true }))).toEqual([])
            expect(Yop.validate("", string({ min: 0 }))).toEqual([])
            expect(Yop.validate("", string({ min: 1 }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate("", string({ min: 2 }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "min",
                constraint: 2,
                message: "Minimum 2 characters"
            }])
            expect(Yop.validate("", string({ match: /\d*/ }))).toEqual([])
            expect(Yop.validate("", string({ match: /\d+/ }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Invalid format"
            }])
            expect(Yop.validate("", string({ oneOf: [] }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: [],
                message: "Must be one of: "
            }])
            expect(Yop.validate("", string({ oneOf: [""] }))).toEqual([])
            expect(Yop.validate("", string({ oneOf: ["", "a"] }))).toEqual([])
            expect(Yop.validate("", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Must be one of: a, b, or c"
            }])
            expect(Yop.validate("", string({ test: context => context.value === "" }))).toEqual([])
            expect(Yop.validate("", string({ test: context => context.value === "a" }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
        })

        it("yop.string.abc", () => {
            expect(Yop.validate("abc", string({ exists: true }))).toEqual([])
            expect(Yop.validate("abc", string({ defined: true }))).toEqual([])
            expect(Yop.validate("abc", string({ notnull: true }))).toEqual([])
            expect(Yop.validate("abc", string({ required: true }))).toEqual([])
            expect(Yop.validate("abc", string({ min: 0 }))).toEqual([])
            expect(Yop.validate("abc", string({ min: 3 }))).toEqual([])
            expect(Yop.validate("abc", string({ min: 4 }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Minimum 4 characters"
            }])
            expect(Yop.validate("abc", string({ min: [4, "Should be 4 or more characters"] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Should be 4 or more characters"
            }])
            expect(Yop.validate("abc", string({ max: 0 }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "max",
                constraint: 0,
                message: "Maximum 0 characters"
            }])
            expect(Yop.validate("abc", string({ max: 2 }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "max",
                constraint: 2,
                message: "Maximum 2 characters"
            }])
            expect(Yop.validate("abc", string({ max: 3 }))).toEqual([])
            expect(Yop.validate("abc", string({ min: 4, max: 2 }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Minimum 4 characters"
            }])
            expect(Yop.validate("abc", string({ match: /\w*/ }))).toEqual([])
            expect(Yop.validate("abc", string({ match: /\d+/ }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", string({ match: [/\d+/, "Should be a number"] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Should be a number"
            }])
            expect(Yop.validate("abc", string({ oneOf: [] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "oneOf",
                constraint: [],
                message: "Must be one of: "
            }])
            expect(Yop.validate("abc", string({ oneOf: ["abc"] }))).toEqual([])
            expect(Yop.validate("abc", string({ oneOf: ["abc", "def"] }))).toEqual([])
            expect(Yop.validate("abc", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Must be one of: a, b, or c"
            }])
            expect(Yop.validate("abc", string({ oneOf: [["a", "b", "c"], "Should be one of the first alphabetical characters"] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Should be one of the first alphabetical characters"
            }])
            expect(Yop.validate("abc", string({ test: context => context.value === "abc" }))).toEqual([])
            expect(Yop.validate("abc", string({ test: context => context.value === "a" }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate("abc", string({ test: [context => context.value === "a", "Should be 'a'"] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Should be 'a'"
            }])
            expect(Yop.validate("abc", string({ test: context => context.value === "a" || "Should be 'a'" }))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Should be 'a'"
            }])
            expect(Yop.validate("abc", string({ test: context => { return context.value === "a" ? undefined :  "Should be 'a'" }}))).toEqual([{
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Should be 'a'"
            }])
        })

        it("yop.string.type", () => {
            expect(Yop.validate(0, string())).toEqual([{
                path: "",
                value: 0,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate(true, string())).toEqual([{
                path: "",
                value: true,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
        })
    })
    describe("yop.email", () => {

        it("yop.email.*", () => {
            expect(Yop.validate("abc@abc.com", email())).toEqual([])
            expect(Yop.validate("", email())).toEqual([{
                path: "",
                value: "",
                kind: "email",
                code: "match",
                constraint: emailRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", email())).toEqual([{
                path: "",
                value: "abc",
                kind: "email",
                code: "match",
                constraint: emailRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", email({ match: [, context => `'${ context.value }' doesn't look like an email` ] }))).toEqual([{
                path: "",
                value: "abc",
                kind: "email",
                code: "match",
                constraint: emailRegex,
                message: "'abc' doesn't look like an email"
            }])
        })
        
        it("yop.email.type", () => {
            expect(Yop.validate(0, email())).toEqual([{
                path: "",
                value: 0,
                kind: "email",
                code: "type",
                constraint: "email",
                message: "Wrong value type (expected email)"
            }])
            expect(Yop.validate(true, email())).toEqual([{
                path: "",
                value: true,
                kind: "email",
                code: "type",
                constraint: "email",
                message: "Wrong value type (expected email)"
            }])
        })
    })

    describe("yop.number", () => {

        it("yop.number.undefined", () => {
            expect(Yop.validate(undefined, number({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, number({ defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "number",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, number({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, number({ required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "number",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, number({ min: 1, max: 1, oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.number.null", () => {
            expect(Yop.validate(null, number({ exists: true }))).toEqual([])
            expect(Yop.validate(null, number({ defined: true }))).toEqual([])
            expect(Yop.validate(null, number({ notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "number",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, number({ required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "number",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, number({ min: 1, max: 1, oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.number.NaN", () => {
            expect(Yop.validate(NaN, number())).toEqual([{
                path: "",
                value: NaN,
                kind: "number",
                code: "type",
                constraint: "number",
                message: "Wrong value type (expected number)"
            }])
        })

        it("yop.number.0", () => {
            expect(Yop.validate(0, number({ exists: true }))).toEqual([])
            expect(Yop.validate(0, number({ defined: true }))).toEqual([])
            expect(Yop.validate(0, number({ notnull: true }))).toEqual([])
            expect(Yop.validate(0, number({ required: true }))).toEqual([])
            expect(Yop.validate(0, number({ min: -1 }))).toEqual([])
            expect(Yop.validate(0, number({ min: 0 }))).toEqual([])
            expect(Yop.validate(0, number({ min: 1 }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 1,
                message: "Must be greater or equal to 1"
            }])
            expect(Yop.validate(0, number({ min: [1, "Should be a positive number"] }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 1,
                message: "Should be a positive number"
            }])
            expect(Yop.validate(0, number({ min: 2 }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 2,
                message: "Must be greater or equal to 2"
            }])
            expect(Yop.validate(0, number({ max: -1 }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "max",
                constraint: -1,
                message: "Must be less or equal to -1"
            }])
            expect(Yop.validate(0, number({ max: 0 }))).toEqual([])
            expect(Yop.validate(0, number({ max: 1 }))).toEqual([])
            expect(Yop.validate(0, number({ oneOf: [] }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "oneOf",
                constraint: [],
                message: "Must be one of: "
            }])
            expect(Yop.validate(0, number({ oneOf: [0] }))).toEqual([])
            expect(Yop.validate(0, number({ oneOf: [0, 1] }))).toEqual([])
            expect(Yop.validate(0, number({ oneOf: [1, 2, 3] }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Must be one of: 1, 2, or 3"
            }])
            expect(Yop.validate(0, number({ oneOf: [[1, 2, 3], "Should be between 1 and 3"] }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Should be between 1 and 3"
            }])
            expect(Yop.validate(0, number({ test: context => context.value === 0 }))).toEqual([])
            expect(Yop.validate(0, number({ test: context => context.value === 1 }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(0, number({ test: [context => context.value === 1, "Should be 1"] }))).toEqual([{
                path: "",
                value: 0,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Should be 1"
            }])
        })

        it("yop.number.123", () => {
            expect(Yop.validate(123, number({ exists: true }))).toEqual([])
            expect(Yop.validate(123, number({ defined: true }))).toEqual([])
            expect(Yop.validate(123, number({ notnull: true }))).toEqual([])
            expect(Yop.validate(123, number({ required: true }))).toEqual([])
            expect(Yop.validate(123, number({ min: 0 }))).toEqual([])
            expect(Yop.validate(123, number({ min: 123 }))).toEqual([])
            expect(Yop.validate(123, number({ min: 124 }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "min",
                constraint: 124,
                message: "Must be greater or equal to 124"
            }])
            expect(Yop.validate(123, number({ max: 0 }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "max",
                constraint: 0,
                message: "Must be less or equal to 0"
            }])
            expect(Yop.validate(123, number({ max: 123 }))).toEqual([])
            expect(Yop.validate(123, number({ min: 124, max: 1 }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "min",
                constraint: 124,
                message: "Must be greater or equal to 124"
            }])
            expect(Yop.validate(123, number({ oneOf: [] }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "oneOf",
                constraint: [],
                message: "Must be one of: "
            }])
            expect(Yop.validate(123, number({ oneOf: [123] }))).toEqual([])
            expect(Yop.validate(123, number({ oneOf: [123, 124] }))).toEqual([])
            expect(Yop.validate(123, number({ oneOf: [1, 2, 3] }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Must be one of: 1, 2, or 3"
            }])
            expect(Yop.validate(123, number({ test: context => context.value === 123 }))).toEqual([])
            expect(Yop.validate(123, number({ test: context => context.value === 1 }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(123, number({ test: [context => context.value === 1, "Should be 1"] }))).toEqual([{
                path: "",
                value: 123,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Should be 1"
            }])
        })

        it("yop.number.type", () => {
            expect(Yop.validate("", number())).toEqual([{
                path: "",
                value: "",
                kind: "number",
                code: "type",
                constraint: "number",
                message: "Wrong value type (expected number)"
            }])
            expect(Yop.validate(true, number())).toEqual([{
                path: "",
                value: true,
                kind: "number",
                code: "type",
                constraint: "number",
                message: "Wrong value type (expected number)"
            }])
        })
    })

    describe("yop.boolean", () => {

        it("yop.boolean.undefined", () => {
            expect(Yop.validate(undefined, boolean({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, boolean({ defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "boolean",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, boolean({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, boolean({ required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "boolean",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, boolean({ oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.boolean.null", () => {
            expect(Yop.validate(null, boolean({ exists: true }))).toEqual([])
            expect(Yop.validate(null, boolean({ defined: true }))).toEqual([])
            expect(Yop.validate(null, boolean({ notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "boolean",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, boolean({ required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "boolean",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, boolean({ oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.boolean.true", () => {
            expect(Yop.validate(true, boolean())).toEqual([])
            expect(Yop.validate(true, boolean({ oneOf: [true] }))).toEqual([])
            expect(Yop.validate(true, boolean({ oneOf: [true, false] }))).toEqual([])
            expect(Yop.validate(true, boolean({ oneOf: [false] }))).toEqual([{
                path: "",
                value: true,
                kind: "boolean",
                code: "oneOf",
                constraint: [false],
                message: "Must be one of: false"
            }])
            expect(Yop.validate(true, boolean({ oneOf: [[false], "Should be false"] }))).toEqual([{
                path: "",
                value: true,
                kind: "boolean",
                code: "oneOf",
                constraint: [false],
                message: "Should be false"
            }])
            expect(Yop.validate(true, boolean({ test: [context => !context.value, "Should be false"] }))).toEqual([{
                path: "",
                value: true,
                kind: "boolean",
                code: "test",
                constraint: false,
                message: "Should be false"
            }])
        })

        it("yop.boolean.false", () => {
            expect(Yop.validate(false, boolean())).toEqual([])
            expect(Yop.validate(false, boolean({ oneOf: [false] }))).toEqual([])
            expect(Yop.validate(false, boolean({ oneOf: [true, false] }))).toEqual([])
            expect(Yop.validate(false, boolean({ oneOf: [true] }))).toEqual([{
                path: "",
                value: false,
                kind: "boolean",
                code: "oneOf",
                constraint: [true],
                message: "Must be one of: true"
            }])
            expect(Yop.validate(false, boolean({ oneOf: [[true], "Should be true"] }))).toEqual([{
                path: "",
                value: false,
                kind: "boolean",
                code: "oneOf",
                constraint: [true],
                message: "Should be true"
            }])
            expect(Yop.validate(false, boolean({ test: [context => context.value, "Should be true"] }))).toEqual([{
                path: "",
                value: false,
                kind: "boolean",
                code: "test",
                constraint: false,
                message: "Should be true"
            }])
        })

        it("yop.boolean.type", () => {
            expect(Yop.validate("", boolean())).toEqual([{
                path: "",
                value: "",
                kind: "boolean",
                code: "type",
                constraint: "boolean",
                message: "Wrong value type (expected boolean)"
            }])
            expect(Yop.validate(0, boolean())).toEqual([{
                path: "",
                value: 0,
                kind: "boolean",
                code: "type",
                constraint: "boolean",
                message: "Wrong value type (expected boolean)"
            }])
        })
    })

    describe("yop.date", () => {

        it("yop.date.undefined", () => {
            expect(Yop.validate(undefined, date({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, date({ defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "date",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, date({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, date({ required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "date",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, date({ oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.date.null", () => {
            expect(Yop.validate(null, date({ exists: true }))).toEqual([])
            expect(Yop.validate(null, date({ defined: true }))).toEqual([])
            expect(Yop.validate(null, date({ notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "date",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, date({ required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "date",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, date({ oneOf: [], test: _ => false }))).toEqual([])
        })

        it("yop.date.*", () => {
            const testDate = new Date(2024, 11, 19)
            const beforeDate = new Date(2024, 11, 18)
            const afterDate = new Date(2024, 11, 20)
            
            expect(Yop.validate(testDate, date())).toEqual([])
            expect(Yop.validate(testDate, date({ min: testDate }))).toEqual([])
            expect(Yop.validate(testDate, date({ min: beforeDate }))).toEqual([])
            expect(Yop.validate(testDate, date({ min: afterDate }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "min",
                constraint: afterDate,
                message: "Date must be greater or equal to 12/20/2024"
            }])
            expect(Yop.validate(testDate, date({ max: testDate }))).toEqual([])
            expect(Yop.validate(testDate, date({ max: afterDate }))).toEqual([])
            expect(Yop.validate(testDate, date({ max: beforeDate }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "max",
                constraint: beforeDate,
                message: "Date must be less or equal to 12/18/2024"
            }])
            expect(Yop.validate(testDate, date({ min: afterDate, max: beforeDate }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "min",
                constraint: afterDate,
                message: "Date must be greater or equal to 12/20/2024"
            }])
            expect(Yop.validate(testDate, date({ min: [afterDate, "Too late!"], max: beforeDate }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "min",
                constraint: afterDate,
                message: "Too late!"
            }])
            expect(Yop.validate(testDate, date({ oneOf: [testDate] }))).toEqual([])
            expect(Yop.validate(testDate, date({ oneOf: [new Date(2024, 11, 19)] }))).toEqual([])
            expect(Yop.validate(testDate, date({ oneOf: [beforeDate, testDate, afterDate] }))).toEqual([])
            expect(Yop.validate(testDate, date({ oneOf: [beforeDate, afterDate] }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "oneOf",
                constraint: [beforeDate, afterDate],
                message: "Must be one of: 12/18/2024 or 12/20/2024"
            }])
            expect(Yop.validate(testDate, date({ oneOf: [[beforeDate, afterDate], "Too early or too late!"] }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "oneOf",
                constraint: [beforeDate, afterDate],
                message: "Too early or too late!"
            }])
            expect(Yop.validate(testDate, date({ test: context => context.value.getFullYear() === 2025 }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(testDate, date({ test: [context => context.value.getFullYear() === 2025, "Should be in 2025!"] }))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "test",
                constraint: false,
                message: "Should be in 2025!"
            }])
            expect(Yop.validate(testDate, date({ test: [
                context => context.value.getFullYear() === 2025,
                context => `Should be in 2025 not in ${ context.value.getFullYear() }!`
            ]}))).toEqual([{
                path: "",
                value: testDate,
                kind: "date",
                code: "test",
                constraint: false,
                message: "Should be in 2025 not in 2024!"
            }])
        })

        it("yop.date.type", () => {
            expect(Yop.validate("", date())).toEqual([{
                path: "",
                value: "",
                kind: "date",
                code: "type",
                constraint: "date",
                message: "Wrong value type (expected date)"
            }])
            expect(Yop.validate(0, date())).toEqual([{
                path: "",
                value: 0,
                kind: "date",
                code: "type",
                constraint: "date",
                message: "Wrong value type (expected date)"
            }])
            expect(Yop.validate(new Date("invalid"), date())).toEqual([{
                path: "",
                value: new Date("invalid"),
                kind: "date",
                code: "type",
                constraint: "date",
                message: "Wrong value type (expected date)"
            }])
        })
    })

    describe("yop.file", () => {

        it("yop.file.undefined", () => {
            expect(Yop.validate(undefined, file({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, file({ defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "file",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, file({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, file({ required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "file",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, file({ min: 0, max: 0, test: _ => false }))).toEqual([])
        })

        it("yop.file.null", () => {
            expect(Yop.validate(null, file({ exists: true }))).toEqual([])
            expect(Yop.validate(null, file({ defined: true }))).toEqual([])
            expect(Yop.validate(null, file({ notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "file",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, file({ required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "file",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, file({ min: 0, max: 0, test: _ => false }))).toEqual([])
        })

        it("yop.file.*", () => {
            const testFile = new File(["1"], "test.txt", { type: "text/plain" })
            
            expect(Yop.validate(testFile, file())).toEqual([])
            expect(Yop.validate(testFile, file({ min: 0 }))).toEqual([])
            expect(Yop.validate(testFile, file({ min: 1 }))).toEqual([])
            expect(Yop.validate(testFile, file({ min: 2 }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "min",
                constraint: 2,
                message: "File must have a size of at least 2 bytes"
            }])
            expect(Yop.validate(testFile, file({ max: 1 }))).toEqual([])
            expect(Yop.validate(testFile, file({ max: 2 }))).toEqual([])
            expect(Yop.validate(testFile, file({ max: 0 }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "max",
                constraint: 0,
                message: "File must have a size of at most 0 bytes"
            }])
            expect(Yop.validate(testFile, file({ min: 2, max: 0 }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "min",
                constraint: 2,
                message: "File must have a size of at least 2 bytes"
            }])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 1 }))).toEqual([])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 2 }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(testFile, file({ test: [context => context.value.size === 2, "File must have exactly 2 bytes"] }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "test",
                constraint: false,
                message: "File must have exactly 2 bytes"
            }])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 2 || "File must have exactly 2 bytes" }))).toEqual([{
                path: "",
                value: testFile,
                kind: "file",
                code: "test",
                constraint: false,
                message: "File must have exactly 2 bytes"
            }])
        })

        it("yop.file.type", () => {
            expect(Yop.validate("", file())).toEqual([{
                path: "",
                value: "",
                kind: "file",
                code: "type",
                constraint: "file",
                message: "Wrong value type (expected file)"
            }])
            expect(Yop.validate(0, file())).toEqual([{
                path: "",
                value: 0,
                kind: "file",
                code: "type",
                constraint: "file",
                message: "Wrong value type (expected file)"
            }])
        })
    })

    describe("yop.array", () => {

        it("yop.array.undefined", () => {
            expect(Yop.validate(undefined, array({ of: string(), exists: true }))).toEqual([])
            expect(Yop.validate(undefined, array({ of: string(), defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "array",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, array({ of: string(), notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, array({ of: string(), required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, array({ of: string(), min: 0, max: 0, test: _ => false }))).toEqual([])
        })

        it("yop.array.null", () => {
            expect(Yop.validate(null, array({ of: string(), exists: true }))).toEqual([])
            expect(Yop.validate(null, array({ of: string(), defined: true }))).toEqual([])
            expect(Yop.validate(null, array({ of: string(), notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "array",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, array({ of: string(), required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, array({ of: string(), min: 0, max: 0, test: _ => false }))).toEqual([])
        })

        it("yop.array.*", () => {
            expect(Yop.validate([], array())).toEqual([])
            expect(Yop.validate([], array({ of: string(), min: 0 }))).toEqual([])
            expect(Yop.validate([], array({ of: string(), min: 1 }))).toEqual([{
                path: "",
                value: [],
                kind: "array",
                code: "min",
                constraint: 1,
                message: "At least 1 element"
            }])
            expect(Yop.validate([], array({ of: string(), max: 0 }))).toEqual([])
            expect(Yop.validate([], array({ of: string(), max: 1 }))).toEqual([])
            expect(Yop.validate([""], array({ of: string(), max: 1 }))).toEqual([])
            expect(Yop.validate([""], array({ of: string(), max: 0 }))).toEqual([{
                path: "",
                value: [""],
                kind: "array",
                code: "max",
                constraint: 0,
                message: "At most 0 elements"
            }])
            expect(Yop.validate([""], array({ of: string(), max: [0, "Should be empty"] }))).toEqual([{
                path: "",
                value: [""],
                kind: "array",
                code: "max",
                constraint: 0,
                message: "Should be empty"
            }])
            expect(Yop.validate([""], array({ of: string(), min: 2, max: 0 }))).toEqual([{
                path: "",
                value: [""],
                kind: "array",
                code: "min",
                constraint: 2,
                message: "At least 2 elements"
            }])
            expect(Yop.validate([""], array({ of: string({ min: 1 }), min: 1 }))).toEqual([{
                path: "[0]",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate([""], array({ of: string({ min: 1 }), min: 2 }))).toEqual([{
                path: "",
                value: [""],
                kind: "array",
                code: "min",
                constraint: 2,
                message: "At least 2 elements"
            }])
            expect(Yop.validate(["a", "b", "c"], array({ of: string({ min: 1 }), min: 2 }))).toEqual([])
            expect(Yop.validate(["ab", "c", "de"], array({ of: string({ max: 1 }), min: 2 }))).toEqual([{
                path: "[0]",
                value: "ab",
                kind: "string",
                code: "max",
                constraint: 1,
                message: "Maximum 1 character"
            }, {
                path: "[2]",
                value: "de",
                kind: "string",
                code: "max",
                constraint: 1,
                message: "Maximum 1 character"
            }])
            expect(Yop.validate(["ab", "c", "de"], array({ of: string({ max: 1 }), max: 2 }))).toEqual([{
                path: "",
                value: ["ab", "c", "de"],
                kind: "array",
                code: "max",
                constraint: 2,
                message: "At most 2 elements"
            }])
        })

        @classId("Test")
        class Test {

            @string({ required: true })
            name: string | null = null
        }

        it("yop.array.Test", () => {
            expect(Yop.validate([], array({ of: Test }))).toEqual([])
            expect(Yop.validate([], array({ of: "Test" }))).toEqual([])
            expect(Yop.validate([{ name: "" }], array({ of: Test }))).toEqual([])
            expect(Yop.validate([{}], array({ of: Test }))).toEqual([{
                path: "[0].name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field",
            }])
        })

        it("yop.array.type", () => {
            expect(Yop.validate("", array())).toEqual([{
                path: "",
                value: "",
                kind: "array",
                code: "type",
                constraint: "array",
                message: "Wrong value type (expected array)"
            }])
            expect(Yop.validate(0, array())).toEqual([{
                path: "",
                value: 0,
                kind: "array",
                code: "type",
                constraint: "array",
                message: "Wrong value type (expected array)"
            }])
            expect(Yop.validate([1], array({ of: string() }))).toEqual([{
                path: "[0]",
                value: 1,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate([1, true], array({ of: string() }))).toEqual([{
                path: "[0]",
                value: 1,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }, {
                path: "[1]",
                value: true,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate([1], array({ of: Test }))).toEqual([{
                path: "[0]",
                value: 1,
                kind: "class",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)",
            }])
            expect(Yop.validate([1], array({ of: "Test" }))).toEqual([{
                path: "[0]",
                value: 1,
                kind: "class",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)",
            }])
        })
    })

    describe("yop.instance", () => {

        class Test {}

        it("yop.instance.undefined", () => {
            expect(Yop.validate(undefined, instance({ of: Test, exists: true }))).toEqual([])
            expect(Yop.validate(undefined, instance({ of: Test, defined: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "instance",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, instance({ of: Test, notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, instance({ of: Test, required: true }))).toEqual([{
                path: "",
                value: undefined,
                kind: "instance",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, instance({ of: Test, test: _ => false }))).toEqual([])
        })

        it("yop.instance.null", () => {
            expect(Yop.validate(null, instance({ of: Test, exists: true }))).toEqual([])
            expect(Yop.validate(null, instance({ of: Test, defined: true }))).toEqual([])
            expect(Yop.validate(null, instance({ of: Test, notnull: true }))).toEqual([{
                path: "",
                value: null,
                kind: "instance",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, instance({ of: Test, required: true }))).toEqual([{
                path: "",
                value: null,
                kind: "instance",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, instance({ of: Test, test: _ => false }))).toEqual([])
        })
        
        @classId("Test2")
        class Test2 {
            
            @string({ required: true, min: 1 })
            name: string | null = null
        }

        it("yop.instance.Test2", () => {
            expect(Yop.validate({}, instance())).toEqual([])
            expect(Yop.validate({}, instance({ of: Test }))).toEqual([])
            expect(Yop.validate({ name: "" }, instance({ of: Test }))).toEqual([])
            expect(Yop.validate({ name: "a" }, instance({ of: Test2 }))).toEqual([])
            expect(Yop.validate({ name: "a" }, instance({ of: "Test2" }))).toEqual([])
            expect(Yop.validate({ name: "" }, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({}, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: undefined }, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: null }, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ age: 2 }, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
        })

        class Test3 {
            
            @string({ required: true, min: 1 })
            name: string | null = null
            
            @number({ min: 1, test: [context => context.parent.name !== "Joe" || context.value >= 10, "No Joe is under 10"] })
            age: number | null = null
        }

        it("yop.instance.Test3", () => {
            expect(Yop.validate({}, instance())).toEqual([])
            expect(Yop.validate({}, instance({ of: Test3 }))).toEqual([{
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "Joe" }, instance({ of: Test3 }))).toEqual([])
            expect(Yop.validate({ name: "Joe", age: 2 }, instance({ of: Test3 }))).toEqual([{
                path: "age",
                value: 2,
                kind: "number",
                code: "test",
                constraint: false,
                message: "No Joe is under 10"
            }])
        })

        class Pet {
            @string({ required: true, min: 1 })
            name: string | null = null
        }

        class Test4 extends Test3 {

            @array({ of: instance({ of: Pet, required: true }), required: true, min: 1 })
            pets: Pet[] | null = null
        }

        it("yop.instance.Test4", () => {
            expect(Yop.validate({}, instance({ of: Test4 }))).toEqual([{
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                path: "pets",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [] }, instance({ of: Test4 }))).toEqual([{
                path: "pets",
                value: [],
                kind: "array",
                code: "min",
                constraint: 1,
                message: "At least 1 element"
            }])
            expect(Yop.validate({ name: "a", pets: [null] }, instance({ of: Test4 }))).toEqual([{
                path: "pets[0]",
                value: null,
                kind: "instance",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [{}] }, instance({ of: Test4 }))).toEqual([{
                path: "pets[0].name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [{ name: "" }] }, instance({ of: Test4 }))).toEqual([{
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }))).toEqual([{
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }, {
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "a", pets: [{ name: "" }] }, instance({ of: Test4 }), "name")).toEqual([])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), "name")).toEqual([{
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), "pets[0].name")).toEqual([{
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), "pets[1].name")).toEqual([])
        })

        it("yop.instance.type", () => {
            expect(Yop.validate("", instance())).toEqual([{
                path: "",
                value: "",
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate(0, instance())).toEqual([{
                path: "",
                value: 0,
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate([], instance())).toEqual([{
                path: "",
                value: [],
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate([], instance({ of: Test2 }))).toEqual([{
                path: "",
                value: [],
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate({ name: 2 }, instance({ of: Test2 }))).toEqual([{
                path: "name",
                value: 2,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
        })
    })

    describe("yop.locale", () => {

        it("yop.locale.set", () => {
            Yop.setLocale("fr-FR")
            expect(Yop.validate("", string({ min: 1 }))).toEqual([{
                code: "min",
                constraint: 1,
                kind: "string",
                message: "Minimum 1 caractère",
                path: "",
                value: "",
            }])
            expect(Yop.validate("", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Doit être parmi : a, b ou c"
            }])
            Yop.setLocale("en-US")
            expect(Yop.validate("", string({ min: 1 }))).toEqual([{
                code: "min",
                constraint: 1,
                kind: "string",
                message: "Minimum 1 character",
                path: "",
                value: "",
            }])
            expect(Yop.validate("", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Must be one of: a, b, or c"
            }])
        })
    })
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
