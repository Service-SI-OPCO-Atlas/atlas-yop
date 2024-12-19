import { InternalValidationContext } from "./ValidationContext";

export interface MessageProvider {

    readonly locale: string

    getMessage(context: InternalValidationContext<unknown>, code: string, constraint: any, message?: string, path?: string): string
}

function formatOneOf(locale: string) {
    return (
        typeof (Intl as any).ListFormat === "function" ?
        new (Intl as any).ListFormat(locale, { type: "disjunction" }) :
        { format: (list: any[]) => list.join(", ") }
    )
}

function format(value: any, numberFormat: Intl.NumberFormat, dateFormat: Intl.DateTimeFormat, listFormat: ReturnType<typeof formatOneOf>): string {
    return (
        typeof value === "number" ? numberFormat.format(value) :
        value instanceof Date ? dateFormat.format(value) :
        Array.isArray(value) ? listFormat.format(value.map(item => format(item, numberFormat, dateFormat, listFormat))) :
        String(value)
    )
}

export class MessageProvider_en_US implements MessageProvider {

    locale = "en-US"

    private numberFormat = new Intl.NumberFormat(this.locale)
    private dateFormat = new Intl.DateTimeFormat(this.locale)
    private listFormat = formatOneOf(this.locale)

    getMessage(context: InternalValidationContext<unknown>, code: string, constraint: any, message?: string): string {

        if (message != null)
            return message

        const plural = typeof constraint === "number" && (constraint > 1 || constraint === 0) ? "s" : ""
        constraint = format(constraint, this.numberFormat, this.dateFormat, this.listFormat)

        switch (context.kind) {
        case "string":
        case "email": switch (code) {
            case "min": return `Minimum ${ constraint } character${ plural }`
            case "max": return `Maximum ${ constraint } character${ plural }`
            case "match": return "Invalid format"
            }
            break
        case "number": switch (code) {
            case "min":
                return `Must be greater or equal to ${ constraint }`
            case "max":
                return `Must be less or equal to ${ constraint }`
            }
            break
        case "date": switch (code) {
            case "min":
                return `Date must be greater or equal to ${ constraint }`
            case "max":
                return `Date must be less or equal to ${ constraint }`
            }
            break
        case "file": switch (code) {
            case "min":
                return `File must have a size of at least ${ constraint } byte${ plural }`
            case "max":
                return `File must have a size of at most ${ constraint } byte${ plural }`
            }
            break
        case "array": switch (code) {
            case "min":
                return `At least ${ constraint } element${ plural }`
            case "max":
                return `At most ${ constraint } element${ plural }`
            }
            break
        }
        switch (code) {
        case "type":
            return `Wrong value type (expected ${ constraint })`
        case "test":
            return "Invalid value"
        case "oneOf":
            return `Must be one of: ${ constraint }`
        case "exists":
        case "defined":
        case "notnull":
        case "required":
            return "Required field"
        }

        return `Unexpected error: ${ context.kind }.${ code }`
    }
}

export class MessageProvider_fr_FR implements MessageProvider {

    locale = "fr-FR"

    private numberFormat = new Intl.NumberFormat(this.locale)
    private dateFormat = new Intl.DateTimeFormat(this.locale)
    private listFormat = formatOneOf(this.locale)

    getMessage(context: InternalValidationContext<unknown>, code: string, constraint: any, message?: string): string {

        if (message != null)
            return message

        const plural = typeof constraint === "number" && constraint > 1 ? "s" : ""
        constraint = format(constraint, this.numberFormat, this.dateFormat, this.listFormat)

        switch (context.kind) {
        case "string":
        case "email": switch (code) {
            case "min": return `Minimum ${ constraint } caractère${ plural }`
            case "max": return `Maximum ${ constraint } caractère${ plural }`
            case "match": return "Format incorrect"
            }
            break
        case "number": switch (code) {
            case "min":
                return `Doit être supérieur ou égal à ${ constraint }`
            case "max":
                return `Doit être inférieur ou égal à ${ constraint }`
            }
            break
        case "date": switch (code) {
            case "min":
                return `La date doit être égale ou postérieure au ${ constraint }`
            case "max":
                return `La date doit être égale ou antérieure au ${ constraint }`
            }
            break
        case "file": switch (code) {
            case "min":
                return `Le fichier doit avoir une taille d'au moins ${ constraint } octet${ plural }`
            case "max":
                return `Le fichier doit avoir une taille d'au plus ${ constraint } octet${ plural }`
            }
            break
        case "array": switch (code) {
            case "min":
                return `Au moins  ${ constraint } élément${ plural }`
            case "max":
                return `Au plus ${ constraint } élément${ plural }`
            }
            break
        }
        switch (code) {
        case "type":
            return `Valeur du mauvais type (${ constraint } attendu)`
        case "test":
            return "Valeur incorrecte"
        case "oneOf":
            return `Doit être parmi : ${ constraint }`
        case "exists":
        case "defined":
        case "notnull":
        case "required":
            return "Champ obligatoire"
        }

        return `Erreur inattendue : ${ context.kind }.${ code }`
    }
}
