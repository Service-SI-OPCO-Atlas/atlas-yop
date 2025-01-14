
export type Constructor<Type = unknown> =
    Type extends unknown ? abstract new (...args: any) => NonNullable<Type> | StringConstructor | BooleanConstructor | NumberConstructor :
    [Type] extends [string | null | undefined] ? StringConstructor :
    [Type] extends [boolean | null | undefined] ? BooleanConstructor :
    [Type] extends [number | null | undefined] ? NumberConstructor :
    abstract new (...args: any) => NonNullable<Type>

export type ArrayElementType<ArrayType> = ArrayType extends Array<infer ElementType> ? ElementType : never

export const isBoolean = <T extends boolean>(value: any): value is T => typeof value === "boolean"
export const isNumber = <T extends number>(value: any): value is T => typeof value === "number" && !isNaN(value)
export const isString = <T extends string>(value: any): value is T => typeof value === "string"
export const isObject = <T extends object>(value: any): value is T => value != null && !Array.isArray(value) && typeof value === "object"
export const isFunction = <T extends Function>(value: any): value is T => typeof value === "function"
export const isDate = <T extends Date>(value: any): value is T => value instanceof Date && !isNaN(value.getTime())
export const isFile = <T extends File>(value: any): value is T => value instanceof File
export const isRegExp = (value: any): value is RegExp => value instanceof RegExp

export const isStringArray = <T extends string>(value: any): value is Array<T> => Array.isArray(value) && value.every(isString)
export const isBooleanArray = <T extends boolean>(value: any): value is Array<T> => Array.isArray(value) && value.every(isBoolean)
export const isNumberArray = <T extends number>(value: any): value is Array<T> => Array.isArray(value) && value.every(isNumber)
export const isDateArray = <T extends Date>(value: any): value is Array<T> => Array.isArray(value) && value.every(isDate)

export const isPromise = <T>(value: any): value is Promise<T> => (
    value != null &&
    typeof value === "object" &&
    "then" in value && typeof value["then"] === "function" &&
    "catch" in value && typeof value["catch"] === "function"
)
