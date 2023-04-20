import { StringSchema } from './StringSchema'
import { NumberSchema } from './NumberSchema'
import { BooleanSchema } from './BooleanSchema'
import { DateSchema } from './DateSchema'
import { ObjectSchema, ObjectPropertiesSchemas } from './ObjectSchema'
import { ArraySchema } from './ArraySchema'
import { AnySchema } from './AnySchema'
import { FileSchema } from './FileSchema'
import { ErrorMessages, en_US_errorMessages, fr_FR_errorMessages } from './localization'
import { IgnoredSchema } from './IgnoredSchema'

export class Yop {

    private static locale = 'en-US'
    private static locales: Record<string, Record<string, ErrorMessages>> = {
        'en-US': en_US_errorMessages,
        'fr-FR': fr_FR_errorMessages,
    }

    private static stringSchema = new StringSchema()
    private static numberSchema = new NumberSchema()
    private static dateSchema = new DateSchema()
    private static booleanSchema = new BooleanSchema()
    private static fileSchema = new FileSchema()
    private static ignoredSchema = new IgnoredSchema()

    static addLocale(locale: string, errorMessages: Record<string, ErrorMessages>) {
        Yop.locales[locale] = errorMessages
    }

    static setLocale(locale: string) {
        Yop.locale = locale
    }

    static getLocale() {
        return Yop.locale
    }

    static getErrorMessages() {
        let messages = Yop.locales[Yop.locale]
        if (messages == null)
            messages = Yop.locales['en-US']
        return messages
    }

    static string() {
        return Yop.stringSchema
    }

    static number() {
        return Yop.numberSchema
    }

    static date() {
        return Yop.dateSchema
    }

    static boolean() {
        return Yop.booleanSchema
    }

    static file() {
        return Yop.fileSchema
    }

    static ignored() {
        return Yop.ignoredSchema as any
    }

    static object<T extends object | null | undefined>(definition: ObjectPropertiesSchemas<T>) {
        return new ObjectSchema<T | null | undefined>(definition)
    }

    static array<T extends any>(elementType: AnySchema<T | null | undefined>) {
        return new ArraySchema<T | null | undefined>(elementType as any) as ArraySchema<T[] | null | undefined>
    }
}
