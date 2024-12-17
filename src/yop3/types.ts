
export type Constructor<Type> =
    [Type] extends [string | null | undefined] ? StringConstructor :
    [Type] extends [boolean | null | undefined] ? BooleanConstructor :
    [Type] extends [number | null | undefined] ? NumberConstructor :
    abstract new (...args: any) => NonNullable<Type>

export type ArrayElementType<ArrayType> = ArrayType extends Array<infer ElementType> ? ElementType : never

export const isBoolean = (value: any): value is boolean => typeof value === "boolean"

export const isNumber = (value: any): value is number => typeof value === "number" && !isNaN(value)

export const isString = (value: any): value is string => typeof value === "string"

export const isObject = (value: any): value is string => value != null && !Array.isArray(value) && typeof value === "object"

export const isFunction = (value: any): value is Function => typeof value === "function"

export const isDate = (value: any): value is Date => value instanceof Date

export const isFile = (value: any): value is File => value instanceof File

export const isRegExp = (value: any): value is RegExp => value instanceof RegExp

export const isStringArray = (value: any): value is Array<string> => Array.isArray(value) && value.every(item => typeof item === "string")

export const isBooleanArray = (value: any) => Array.isArray(value) && value.every(item => typeof item === "boolean")