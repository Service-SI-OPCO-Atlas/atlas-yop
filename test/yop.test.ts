import { describe, expect, it } from "vitest"
import { string } from "../src/yop/decorators/string"
import { Yop } from "../src/yop/Yop"
import { array, boolean, id, date, email, emailRegex, file, instance, number, ValidationStatus, isPromise, extendedPromise } from "../src"
import { test } from "../src/yop/decorators/test"
import { time, timeRegex } from "../src/yop/decorators/time"

describe("yop", () => {

    describe("yop.string", () => {

        it("yop.string.undefined", () => {
            expect(Yop.validate(undefined, string({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, string({ defined: true }))).toEqual([{
                level: "error",
                path: "",
                value: undefined,
                kind: "string",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, string({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, string({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "string",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, string({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate("", string({ min: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "min",
                constraint: 2,
                message: "Minimum 2 characters"
            }])
            expect(Yop.validate("", string({ match: /\d*/ }))).toEqual([])
            expect(Yop.validate("", string({ match: /\d+/ }))).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Invalid format"
            }])
            expect(Yop.validate("", string({ oneOf: [] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Must be one of: a, b, or c"
            }])
            expect(Yop.validate("", string({ test: context => context.value === "" }))).toEqual([])
            expect(Yop.validate("", string({ test: context => context.value === "a" }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Minimum 4 characters"
            }])
            expect(Yop.validate("abc", string({ min: [4, "Should be 4 or more characters"] }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Should be 4 or more characters"
            }])
            expect(Yop.validate("abc", string({ max: 0 }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "max",
                constraint: 0,
                message: "Maximum 0 characters"
            }])
            expect(Yop.validate("abc", string({ max: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "max",
                constraint: 2,
                message: "Maximum 2 characters"
            }])
            expect(Yop.validate("abc", string({ max: 3 }))).toEqual([])
            expect(Yop.validate("abc", string({ min: 4, max: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "min",
                constraint: 4,
                message: "Minimum 4 characters"
            }])
            expect(Yop.validate("abc", string({ match: /\w*/ }))).toEqual([])
            expect(Yop.validate("abc", string({ match: /\d+/ }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", string({ match: [/\d+/, "Should be a number"] }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "match",
                constraint: /\d+/,
                message: "Should be a number"
            }])
            expect(Yop.validate("abc", string({ oneOf: [] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Must be one of: a, b, or c"
            }])
            expect(Yop.validate("abc", string({ oneOf: [["a", "b", "c"], "Should be one of the first alphabetical characters"] }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Should be one of the first alphabetical characters"
            }])
            expect(Yop.validate("abc", string({ test: context => context.value === "abc" }))).toEqual([])
            expect(Yop.validate("abc", string({ test: context => context.value === "a" }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate("abc", string({ test: context => [context.value === "a", "Should be 'a'"] }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Should be 'a'"
            }])
            expect(Yop.validate("abc", string({ test: context => context.value === "a" || "Should be 'a'" }))).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Should be 'a'"
            }])
            expect(Yop.validate("abc", string({ test: context => { return context.value === "a" ? undefined :  "Should be 'a'" }}))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: 0,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate(true, string())).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "email",
                code: "match",
                constraint: emailRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", email())).toEqual([{
                level: "error",
                path: "",
                value: "abc",
                kind: "email",
                code: "match",
                constraint: emailRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("abc", email({ match: context => [, `'${ context.value }' doesn't look like an email` ] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: 0,
                kind: "email",
                code: "type",
                constraint: "email",
                message: "Wrong value type (expected email)"
            }])
            expect(Yop.validate(true, email())).toEqual([{
                level: "error",
                path: "",
                value: true,
                kind: "email",
                code: "type",
                constraint: "email",
                message: "Wrong value type (expected email)"
            }])
        })
    })
    
    describe("yop.time", () => {

        it("yop.time.*", () => {
            expect(Yop.validate("00:00", time())).toEqual([])
            expect(Yop.validate("00:00:00.000", time())).toEqual([])
            expect(Yop.validate("23:59:59.999", time())).toEqual([])
            expect(Yop.validate("", time())).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "time",
                code: "match",
                constraint: timeRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("24:00", time())).toEqual([{
                level: "error",
                path: "",
                value: "24:00",
                kind: "time",
                code: "match",
                constraint: timeRegex,
                message: "Invalid format"
            }])
            expect(Yop.validate("01:59", time({ min: "01:00", max: "02:00" }))).toEqual([])
            expect(Yop.validate("01:59", time({ min: "2", max: "02:00" }))).toEqual([])
            expect(Yop.validate("00:59", time({ min: "01:00", max: "02:00" }))).toEqual([{
                level: "error",
                path: "",
                value: "00:59",
                kind: "time",
                code: "min",
                constraint: "01:00",
                message: "Must be after or equal to 01:00"
            }])
            expect(Yop.validate("02:01", time({ min: "01:00", max: "02:00" }))).toEqual([{
                level: "error",
                path: "",
                value: "02:01",
                kind: "time",
                code: "max",
                constraint: "02:00",
                message: "Must be before or equal to 02:00"
            }])
        })
    })

    describe("yop.number", () => {

        it("yop.number.undefined", () => {
            expect(Yop.validate(undefined, number({ exists: true }))).toEqual([])
            expect(Yop.validate(undefined, number({ defined: true }))).toEqual([{
                level: "error",
                path: "",
                value: undefined,
                kind: "number",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, number({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, number({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "number",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, number({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
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
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 1,
                message: "Must be greater or equal to 1"
            }])
            expect(Yop.validate(0, number({ min: [1, "Should be a positive number"] }))).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 1,
                message: "Should be a positive number"
            }])
            expect(Yop.validate(0, number({ min: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "min",
                constraint: 2,
                message: "Must be greater or equal to 2"
            }])
            expect(Yop.validate(0, number({ max: -1 }))).toEqual([{
                level: "error",
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
                level: "error",
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
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Must be one of: 1, 2, or 3"
            }])
            expect(Yop.validate(0, number({ oneOf: [[1, 2, 3], "Should be between 1 and 3"] }))).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Should be between 1 and 3"
            }])
            expect(Yop.validate(0, number({ test: context => context.value === 0 }))).toEqual([])
            expect(Yop.validate(0, number({ test: context => context.value === 1 }))).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(0, number({ test: context => [context.value === 1, "Should be 1"] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: 123,
                kind: "number",
                code: "min",
                constraint: 124,
                message: "Must be greater or equal to 124"
            }])
            expect(Yop.validate(123, number({ max: 0 }))).toEqual([{
                level: "error",
                path: "",
                value: 123,
                kind: "number",
                code: "max",
                constraint: 0,
                message: "Must be less or equal to 0"
            }])
            expect(Yop.validate(123, number({ max: 123 }))).toEqual([])
            expect(Yop.validate(123, number({ min: 124, max: 1 }))).toEqual([{
                level: "error",
                path: "",
                value: 123,
                kind: "number",
                code: "min",
                constraint: 124,
                message: "Must be greater or equal to 124"
            }])
            expect(Yop.validate(123, number({ oneOf: [] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: 123,
                kind: "number",
                code: "oneOf",
                constraint: [1, 2, 3],
                message: "Must be one of: 1, 2, or 3"
            }])
            expect(Yop.validate(123, number({ test: context => context.value === 123 }))).toEqual([])
            expect(Yop.validate(123, number({ test: context => context.value === 1 }))).toEqual([{
                level: "error",
                path: "",
                value: 123,
                kind: "number",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(123, number({ test: context => [context.value === 1, "Should be 1"] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "number",
                code: "type",
                constraint: "number",
                message: "Wrong value type (expected number)"
            }])
            expect(Yop.validate(true, number())).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: undefined,
                kind: "boolean",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, boolean({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, boolean({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "boolean",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, boolean({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: true,
                kind: "boolean",
                code: "oneOf",
                constraint: [false],
                message: "Must be one of: false"
            }])
            expect(Yop.validate(true, boolean({ oneOf: [[false], "Should be false"] }))).toEqual([{
                level: "error",
                path: "",
                value: true,
                kind: "boolean",
                code: "oneOf",
                constraint: [false],
                message: "Should be false"
            }])
            expect(Yop.validate(true, boolean({ test: context => [!context.value, "Should be false"] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: false,
                kind: "boolean",
                code: "oneOf",
                constraint: [true],
                message: "Must be one of: true"
            }])
            expect(Yop.validate(false, boolean({ oneOf: [[true], "Should be true"] }))).toEqual([{
                level: "error",
                path: "",
                value: false,
                kind: "boolean",
                code: "oneOf",
                constraint: [true],
                message: "Should be true"
            }])
            expect(Yop.validate(false, boolean({ test: context => [context.value, "Should be true"] }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "boolean",
                code: "type",
                constraint: "boolean",
                message: "Wrong value type (expected boolean)"
            }])
            expect(Yop.validate(0, boolean())).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: undefined,
                kind: "date",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, date({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, date({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "date",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, date({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
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
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "max",
                constraint: beforeDate,
                message: "Date must be less or equal to 12/18/2024"
            }])
            expect(Yop.validate(testDate, date({ min: afterDate, max: beforeDate }))).toEqual([{
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "min",
                constraint: afterDate,
                message: "Date must be greater or equal to 12/20/2024"
            }])
            expect(Yop.validate(testDate, date({ min: [afterDate, "Too late!"], max: beforeDate }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "oneOf",
                constraint: [beforeDate, afterDate],
                message: "Must be one of: 12/18/2024 or 12/20/2024"
            }])
            expect(Yop.validate(testDate, date({ oneOf: [[beforeDate, afterDate], "Too early or too late!"] }))).toEqual([{
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "oneOf",
                constraint: [beforeDate, afterDate],
                message: "Too early or too late!"
            }])
            expect(Yop.validate(testDate, date({ test: context => context.value.getFullYear() === 2025 }))).toEqual([{
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(testDate, date({ test: context => [context.value.getFullYear() === 2025, "Should be in 2025!"] }))).toEqual([{
                level: "error",
                path: "",
                value: testDate,
                kind: "date",
                code: "test",
                constraint: false,
                message: "Should be in 2025!"
            }])
            expect(Yop.validate(testDate, date({ test: context => [
                context.value.getFullYear() === 2025,
                `Should be in 2025 not in ${ context.value.getFullYear() }!`
            ]}))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "date",
                code: "type",
                constraint: "date",
                message: "Wrong value type (expected date)"
            }])
            expect(Yop.validate(0, date())).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "date",
                code: "type",
                constraint: "date",
                message: "Wrong value type (expected date)"
            }])
            expect(Yop.validate(new Date("invalid"), date())).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: undefined,
                kind: "file",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, file({ notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, file({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "file",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, file({ required: true }))).toEqual([{
                level: "error",
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
                level: "error",
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
                level: "error",
                path: "",
                value: testFile,
                kind: "file",
                code: "max",
                constraint: 0,
                message: "File must have a size of at most 0 bytes"
            }])
            expect(Yop.validate(testFile, file({ min: 2, max: 0 }))).toEqual([{
                level: "error",
                path: "",
                value: testFile,
                kind: "file",
                code: "min",
                constraint: 2,
                message: "File must have a size of at least 2 bytes"
            }])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 1 }))).toEqual([])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 2 }))).toEqual([{
                level: "error",
                path: "",
                value: testFile,
                kind: "file",
                code: "test",
                constraint: false,
                message: "Invalid value"
            }])
            expect(Yop.validate(testFile, file({ test: context => [context.value.size === 2, "File must have exactly 2 bytes"] }))).toEqual([{
                level: "error",
                path: "",
                value: testFile,
                kind: "file",
                code: "test",
                constraint: false,
                message: "File must have exactly 2 bytes"
            }])
            expect(Yop.validate(testFile, file({ test: context => context.value.size === 2 || "File must have exactly 2 bytes" }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "file",
                code: "type",
                constraint: "file",
                message: "Wrong value type (expected file)"
            }])
            expect(Yop.validate(0, file())).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: undefined,
                kind: "array",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, array({ of: string(), notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, array({ of: string(), required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "array",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, array({ of: string(), required: true }))).toEqual([{
                level: "error",
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
                level: "error",
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
                level: "error",
                path: "",
                value: [""],
                kind: "array",
                code: "max",
                constraint: 0,
                message: "At most 0 elements"
            }])
            expect(Yop.validate([""], array({ of: string(), max: [0, "Should be empty"] }))).toEqual([{
                level: "error",
                path: "",
                value: [""],
                kind: "array",
                code: "max",
                constraint: 0,
                message: "Should be empty"
            }])
            expect(Yop.validate([""], array({ of: string(), min: 2, max: 0 }))).toEqual([{
                level: "error",
                path: "",
                value: [""],
                kind: "array",
                code: "min",
                constraint: 2,
                message: "At least 2 elements"
            }])
            expect(Yop.validate([""], array({ of: string({ min: 1 }), min: 1 }))).toEqual([{
                level: "error",
                path: "[0]",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate([""], array({ of: string({ min: 1 }), min: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: [""],
                kind: "array",
                code: "min",
                constraint: 2,
                message: "At least 2 elements"
            }])
            expect(Yop.validate(["a", "b", "c"], array({ of: string({ min: 1 }), min: 2 }))).toEqual([])
            expect(Yop.validate(["ab", "c", "de"], array({ of: string({ max: 1 }), min: 2 }))).toEqual([{
                level: "error",
                path: "[0]",
                value: "ab",
                kind: "string",
                code: "max",
                constraint: 1,
                message: "Maximum 1 character"
            }, {
                level: "error",
                path: "[2]",
                value: "de",
                kind: "string",
                code: "max",
                constraint: 1,
                message: "Maximum 1 character"
            }])
            expect(Yop.validate(["ab", "c", "de"], array({ of: string({ max: 1 }), max: 2 }))).toEqual([{
                level: "error",
                path: "",
                value: ["ab", "c", "de"],
                kind: "array",
                code: "max",
                constraint: 2,
                message: "At most 2 elements"
            }])
        })

        @id("Test")
        class Test {

            @string({ required: true })
            name: string | null = null
        }

        it("yop.array.Test", () => {
            expect(Yop.validate([], array({ of: Test }))).toEqual([])
            expect(Yop.validate([], array({ of: "Test" }))).toEqual([])
            expect(Yop.validate([{ name: "" }], array({ of: Test }))).toEqual([])
            expect(Yop.validate([{}], array({ of: Test }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: "",
                kind: "array",
                code: "type",
                constraint: "array",
                message: "Wrong value type (expected array)"
            }])
            expect(Yop.validate(0, array())).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "array",
                code: "type",
                constraint: "array",
                message: "Wrong value type (expected array)"
            }])
            expect(Yop.validate([1], array({ of: string() }))).toEqual([{
                level: "error",
                path: "[0]",
                value: 1,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate([1, true], array({ of: string() }))).toEqual([{
                level: "error",
                path: "[0]",
                value: 1,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }, {
                level: "error",
                path: "[1]",
                value: true,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
            expect(Yop.validate([1], array({ of: Test }))).toEqual([{
                level: "error",
                path: "[0]",
                value: 1,
                kind: "class",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)",
            }])
            expect(Yop.validate([1], array({ of: "Test" }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: undefined,
                kind: "instance",
                code: "defined",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(undefined, instance({ of: Test, notnull: true }))).toEqual([])
            expect(Yop.validate(undefined, instance({ of: Test, required: true }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "",
                value: null,
                kind: "instance",
                code: "notnull",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, instance({ of: Test, required: true }))).toEqual([{
                level: "error",
                path: "",
                value: null,
                kind: "instance",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate(null, instance({ of: Test, test: _ => false }))).toEqual([])
        })
        
        @id("Test2")
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
                level: "error",
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({}, instance({ of: Test2 }))).toEqual([{
                level: "error",
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: undefined }, instance({ of: Test2 }))).toEqual([{
                level: "error",
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: null }, instance({ of: Test2 }))).toEqual([{
                level: "error",
                path: "name",
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ age: 2 }, instance({ of: Test2 }))).toEqual([{
                level: "error",
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
            
            @number({ min: 1, test: context => [context.parent.name !== "Joe" || context.value >= 10, "No Joe is under 10"] })
            age: number | null = null
        }

        it("yop.instance.Test3", () => {
            expect(Yop.validate({}, instance())).toEqual([])
            expect(Yop.validate({}, instance({ of: Test3 }))).toEqual([{
                level: "error",
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "Joe" }, instance({ of: Test3 }))).toEqual([])
            expect(Yop.validate({ name: "Joe", age: 2 }, instance({ of: Test3 }))).toEqual([{
                level: "error",
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
                level: "error",
                path: "name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "pets",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [] }, instance({ of: Test4 }))).toEqual([{
                level: "error",
                path: "pets",
                value: [],
                kind: "array",
                code: "min",
                constraint: 1,
                message: "At least 1 element"
            }])
            expect(Yop.validate({ name: "a", pets: [null] }, instance({ of: Test4 }))).toEqual([{
                level: "error",
                path: "pets[0]",
                value: null,
                kind: "instance",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [{}] }, instance({ of: Test4 }))).toEqual([{
                level: "error",
                path: "pets[0].name",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ name: "a", pets: [{ name: "" }] }, instance({ of: Test4 }))).toEqual([{
                level: "error",
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }))).toEqual([{
                level: "error",
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }, {
                level: "error",
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "a", pets: [{ name: "" }] }, instance({ of: Test4 }), { path: "name" })).toEqual([])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), { path: "name" })).toEqual([{
                level: "error",
                path: "name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), { path: "pets[0].name" })).toEqual([{
                level: "error",
                path: "pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }])
            expect(Yop.validate({ name: "", pets: [{ name: "" }] }, instance({ of: Test4 }), { path: "pets[1].name" })).toEqual([])
        })

        it("yop.instance.type", () => {
            expect(Yop.validate("", instance())).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate(0, instance())).toEqual([{
                level: "error",
                path: "",
                value: 0,
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate([], instance())).toEqual([{
                level: "error",
                path: "",
                value: [],
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate([], instance({ of: Test2 }))).toEqual([{
                level: "error",
                path: "",
                value: [],
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate({ name: 2 }, instance({ of: Test2 }))).toEqual([{
                level: "error",
                path: "name",
                value: 2,
                kind: "string",
                code: "type",
                constraint: "string",
                message: "Wrong value type (expected string)"
            }])
        })
    })

    describe("yop.all", () => {
        class Pet {
            @string({ required: true, min: 1 })
            name: string | null = null
        }
        
        class Dog extends Pet {
            @string({ required: true, min: 2 })
            food: string | null = null
        }

        @id("Person")
        @test(context => context.value.pets.length === 0 && context.value.nicknames.length === 2 ? "Nobody should have two nicknames and no pets!" : true)
        class Person {

            @string({
                required: context => context.parent.lastName != null,
                min: 2,
                max: 20,
                match: [/^[a-zA-Z]+$/, "First name must only contains letters"]
            })
            firstName: string | null = null
            
            @string({
                required: context => context.parent.firstName != null,
                min: [2, "Last name must be at least 2 characters long"],
            })
            lastName: string | null = null
            
            @email({ match: [, "Invalid email"] })                
            email: string | null = null

            @date({ required: true, min: new Date(1900, 0, 1), max: new Date })
            birthDate: Date | null = null
            
            @number({ min: context => [0, `Should be inferred from birthDate but ${ context.value } doesn't look good`, "warning"], max: 150 })                
            age: number | null = null

            @string({ oneOf: ["green", "yellow"] })
            color: "blue" | "green" | "yellow" | null = null

            @array({
                of: string({ required: true, min: 2, max: 20 }),
                required: true,
                min: 2,
            })
            nicknames: string[] = null as any

            @array({ of: Dog, required: true })
            pets: Pet[] = null as any

            @boolean({ oneOf: [[true], "Should be true"] })
            friendly: boolean | null = null

            @instance({ of: "Person", required: context => context.parent.friendly === true })
            bestFriend: Person | null = null

            @array({
                of: instance({ of: "Person", required: true }),
                required: context => context.parent.friendly === true,
                min: context => context.parent.friendly === true ? 2 : 0,
            })
            friends: Person[] = null as any

            @file({ exists: true, min: context => (context.parent.age ?? 0) >= 30 ? 1000 : 0 })
            diary: File | null = null
        }

        it("yop.all.Person", () => {
            expect(Yop.validate(undefined, instance({ of: Person }))).toEqual([])
            expect(Yop.validate(null, instance({ of: Person }))).toEqual([])
            expect(Yop.validate(1, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "",
                value: 1,
                kind: "instance",
                code: "type",
                constraint: "object",
                message: "Wrong value type (expected object)"
            }])
            expect(Yop.validate({}, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "birthDate",
                value: undefined,
                kind: "date",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "nicknames",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "pets",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "diary",
                value: undefined,
                kind: "file",
                code: "exists",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ birthDate: new Date(2024, 11, 21) }, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "nicknames",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "pets",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "diary",
                value: undefined,
                kind: "file",
                code: "exists",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ birthDate: new Date(2024, 11, 21), pets: [] }, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "nicknames",
                value: undefined,
                kind: "array",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "diary",
                value: undefined,
                kind: "file",
                code: "exists",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ birthDate: new Date(2024, 11, 21), pets: [], nicknames: ["foo", "bar"] }, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "diary",
                value: undefined,
                kind: "file",
                code: "exists",
                constraint: true,
                message: "Required field"
            }])
            expect(Yop.validate({ birthDate: new Date(2024, 11, 21), pets: [], nicknames: ["foo", "bar"], diary: undefined, age: -1 }, instance({ of: Person }))).toEqual([{
                level: "warning",
                path: "age",
                value: -1,
                kind: "number",
                code: "min",
                constraint: 0,
                message: "Should be inferred from birthDate but -1 doesn't look good"
            }])
            const value = { birthDate: new Date(2024, 11, 21), pets: [], nicknames: ["foo", "bar"], diary: undefined }
            expect(Yop.validate(value, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "",
                value: value,
                kind: "instance",
                code: "test",
                constraint: false,
                message: "Nobody should have two nicknames and no pets!"
            }])
            expect(Yop.validate({ birthDate: new Date(2024, 11, 21), pets: [], nicknames: ["foo", "bar", "bor"], diary: undefined }, instance({ of: Person }))).toEqual([])

            const diary = new File([new ArrayBuffer(999)], "diary.txt", { type: "text/plain" })
            expect(Yop.validate({
                firstName: "John",
                lastName: "Doe",
                email: "jd@jd.com",
                birthDate: new Date(2024, 11, 21),
                age: 30,
                color: "green",
                nicknames: ["johnny", "jd"],
                pets: [{ name: "Rex", food: "Meat" }],
                friendly: true,
                bestFriend: {
                    birthDate: new Date(2024, 11, 21),
                    pets: [],
                    nicknames: ["foo", "bar", "bir"],
                    diary: undefined,
                },
                friends: [{
                    firstName: "Joe",
                    birthDate: new Date(2024, 11, 21),
                    pets: [{ name: "" }],
                    nicknames: ["foo", "bar"],
                    diary: undefined,
                }, {
                    birthDate: new Date(2024, 11, 21),
                    pets: [],
                    nicknames: ["foo", "bar", "a"],
                    friends: [{
                        birthDate: new Date(2024, 11, 21),
                        pets: [{ name: "", food: "Meat" }],
                        nicknames: ["foo", "bar"],
                        diary: undefined,
                    }],
                    diary: undefined,
                }],
                diary: diary
            }, instance({ of: Person }))).toEqual([{
                level: "error",
                path: "friends[0].lastName",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "friends[0].pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }, {
                level: "error",
                path: "friends[0].pets[0].food",
                value: undefined,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }, {
                level: "error",
                path: "friends[1].nicknames[2]",
                value: "a",
                kind: "string",
                code: "min",
                constraint: 2,
                message: "Minimum 2 characters"
            }, {
                level: "error",
                path: "friends[1].friends[0].pets[0].name",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character"
            }, {
                level: "error",
                path: "diary",
                value: diary,
                kind: "file",
                code: "min",
                constraint: 1000,
                message: "File must have a size of at least 1,000 bytes"
            }])
        })
    })

    describe("yop.async", () => {

        it("yop.async.simple", async () => {
            const constraint = string({ test: context => [
                fetch("https://www.purgomalum.com/service/containsprofanity?add=cde&text=" + context.value)
                .then(response => {
                    if (!response.ok)
                        throw `Error ${ response.status }: ${ response.statusText }`
                    return response.text()
                })
                .then(response => response !== "true" || "Contains inappropriate content"),
                "Checking for inappropriate content..."
            ]})
            const yop = new Yop()
            let statuses = yop.validate("abc", constraint)
            
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "" &&
                statuses[0].value === "abc" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("")?.status).toBeUndefined()
            expect(yop.validate("abc", constraint)).toEqual([])

            statuses = yop.validate("bcd", constraint)
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "" &&
                statuses[0].value === "bcd" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("")?.status).toBeUndefined()
            expect(yop.validate("bcd", constraint)).toEqual([])

            statuses = yop.validate("cde", constraint)
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "" &&
                statuses[0].value === "cde" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("")?.status).toEqual({
                level: "error",
                path: "",
                value: "cde",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Contains inappropriate content"
            })
            expect(yop.validate("cde", constraint)).toEqual([{
                level: "error",
                path: "",
                value: "cde",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Contains inappropriate content"
            }])
        })

        it("yop.async.unavailable1", async () => {
            const constraint = string({ test: context =>
                fetch("https://www.purgomalum.com/service/cont****fanity?add=cde&text=" + context.value)
                .then(response => {
                    if (!response.ok)
                        throw `Error ${ response.status }: ${ response.statusText }`
                    return response.text()
                })
                .then(response => response !== "true" || "Contains inappropriate content"),
            })
            const yop = new Yop()
            let statuses = yop.validate("abc", constraint)
            
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "" &&
                statuses[0].value === "abc" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Pending..."
            )
            expect(yop.asyncStatuses.get("")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("")?.status).toEqual({
                level: "unavailable",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Error 404: Not Found"
            })
            expect(yop.validate("abc", constraint)).toEqual([{
                level: "unavailable",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Error 404: Not Found"
            }])
        })

        it("yop.async.unavailable2", async () => {
            const constraint = string({ test: context =>
                fetch("https://www.pur****lum.com/service/containsprofanity?add=cde&text=" + context.value)
                .then(response => {
                    if (!response.ok)
                        throw `Error ${ response.status }: ${ response.statusText }`
                    return response.text()
                })
                .then(response => response !== "true" || "Contains inappropriate content"),
            })
            const yop = new Yop()
            let statuses = yop.validate("abc", constraint)
            
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "" &&
                statuses[0].value === "abc" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Pending..."
            )
            expect(yop.asyncStatuses.get("")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("")?.status).toEqual({
                level: "unavailable",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "TypeError: fetch failed"
            })
            expect(yop.validate("abc", constraint)).toEqual([{
                level: "unavailable",
                path: "",
                value: "abc",
                kind: "string",
                code: "test",
                constraint: false,
                message: "TypeError: fetch failed"
            }])
        })

        it("yop.async.extended", async () => {

            class Test {
                
                @string({ test: context => [
                    extendedPromise({
                        promise: fetch(`https://www.purgomalum.com/service/containsprofanity?add=cde&text=${ context.value }+${ context.parent.nickname ?? "" }`)
                            .then(response => {
                                if (!response.ok)
                                    throw `Error ${ response.status }: ${ response.statusText }`
                                return response.text()
                            })
                            .then(response => response !== "true" || "Contains inappropriate content"),
                        getDependencies: context => [context.value, context.parent.nickname],
                        shouldRevalidate: (previous, current, status) => status?.level !== "unavailable" && (previous[0] !== current[0] || previous[1] !== current[1]),
                    }),
                    "Checking for inappropriate content..."
                ]})
                name: string | null = null

                nickname: string | null = null

                age: number | null = null
            }

            const yop = new Yop()
            expect(yop.validate({}, instance({ of: Test }))).toEqual([])

            const test: Test = {
                name: "abc",
                nickname: "foo",
                age: 30
            }
            
            let statuses = yop.validate(test, instance({ of: Test }))
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "name" &&
                statuses[0].value === "abc" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("name")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("name")?.status).toBeUndefined()
            expect(yop.validate(test, instance({ of: Test }))).toEqual([])

            test.age = 31
            expect(yop.validate(test, instance({ of: Test }))).toEqual([])

            test.nickname = "bar"
            statuses = yop.validate(test, instance({ of: Test }))
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "name" &&
                statuses[0].value === "abc" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("name")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("name")?.status).toBeUndefined()
            expect(yop.validate(test, instance({ of: Test }))).toEqual([])

            test.name = "bcd"
            statuses = yop.validate(test, instance({ of: Test }))
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "name" &&
                statuses[0].value === "bcd" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("name")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("name")?.status).toBeUndefined()
            expect(yop.validate(test, instance({ of: Test }))).toEqual([])

            test.name = "cde"
            statuses = yop.validate(test, instance({ of: Test }))
            expect(statuses).toSatisfy((statuses: ValidationStatus[]) =>
                statuses.length === 1 &&
                statuses[0].level === "pending" &&
                statuses[0].path === "name" &&
                statuses[0].value === "cde" &&
                statuses[0].kind === "string" &&
                statuses[0].code === "test" &&
                isPromise(statuses[0].constraint) &&
                statuses[0].message === "Checking for inappropriate content..."
            )
            expect(yop.asyncStatuses.get("name")?.status).toEqual(statuses[0])
            await statuses[0].constraint
            expect(yop.asyncStatuses.get("name")?.status).toEqual({
                level: "error",
                path: "name",
                value: "cde",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Contains inappropriate content"
            })
            expect(yop.validate(test, instance({ of: Test }))).toEqual([{
                level: "error",
                path: "name",
                value: "cde",
                kind: "string",
                code: "test",
                constraint: false,
                message: "Contains inappropriate content"
            }])
        })
    })

    describe("yop.groups", () => {

        it("yop.groups.1", () => {

            const recap = "recap"
            class Test {
                
                @string(
                    { required: true, min: 1 },
                    { [recap]: { test: context => (context.parent.age ?? 0) > context.value.length } }
                )
                name: string | null = null
                
                @number({ min: 1 })
                age: number | null = null
            }

            expect(Yop.validate(null, instance({ of: Test }), { groups: [undefined, recap] })).toEqual([])

            const enforce = "enforce"

            expect(Yop.validate(
                null,
                string({ defined: true }, { [enforce]: { required: true } }),
            )).toEqual([])

            expect(Yop.validate(
                null,
                string({ defined: true }, { [enforce]: { required: true } }),
                { groups: enforce }
            )).toEqual([{
                level: "error",
                path: "",
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])

            expect(Yop.validate(
                null,
                string({ defined: true }, { [enforce]: { required: true } }),
                { groups: [undefined, enforce] }
            )).toEqual([{
                level: "error",
                path: "",
                value: null,
                kind: "string",
                code: "required",
                constraint: true,
                message: "Required field"
            }])
        })
    })

    describe("yop.locale", () => {

        it("yop.locale.set", () => {
            Yop.setLocale("fr-FR")
            expect(Yop.validate("", string({ min: 1 }))).toEqual([{
                level: "error",
                path: "",
                value: "",
                code: "min",
                kind: "string",
                constraint: 1,
                message: "Minimum 1 caractère",
            }])
            expect(Yop.validate("", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "oneOf",
                constraint: ["a", "b", "c"],
                message: "Doit être parmi : a, b ou c"
            }])
            Yop.setLocale("en-US")
            expect(Yop.validate("", string({ min: 1 }))).toEqual([{
                level: "error",
                path: "",
                value: "",
                kind: "string",
                code: "min",
                constraint: 1,
                message: "Minimum 1 character",
            }])
            expect(Yop.validate("", string({ oneOf: ["a", "b", "c"] }))).toEqual([{
                level: "error",
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
