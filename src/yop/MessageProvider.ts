import { ConstraintMessage } from "./constraints/Constraint";
import { InternalValidationContext, Level } from "./ValidationContext";

export interface MessageProvider {

    readonly locale: string

    getMessage(context: InternalValidationContext<unknown>, code: string, constraint: any, message: ConstraintMessage | undefined, level: Level): ConstraintMessage
}

function format(value: any, numberFormat: Intl.NumberFormat, dateFormat: Intl.DateTimeFormat, listFormat: Intl.ListFormat): string {
    return (
        typeof value === "number" ? numberFormat.format(value) :
        value instanceof Date ? dateFormat.format(value) :
        Array.isArray(value) ? listFormat.format(value.map(item => format(item, numberFormat, dateFormat, listFormat))) :
        String(value)
    )
}

type MessageProps = {
    context: InternalValidationContext<unknown>
    code: string
    constraint: {
        raw: any
        formatted: string
        plural?: Intl.LDMLPluralRule
    }
    level: Level
}

type MessageFunction = (props: MessageProps) => string

export class BasicMessageProvider implements MessageProvider {

    private readonly numberFormat
    private readonly dateFormat
    private readonly listFormat
    private readonly pluralRules

    readonly messages

    constructor(readonly locale: string, entries?: (readonly [string, MessageFunction])[]) {
        this.numberFormat = new Intl.NumberFormat(this.locale)
        this.dateFormat = new Intl.DateTimeFormat(this.locale)
        this.listFormat = new Intl.ListFormat(this.locale, { type: "disjunction" })
        this.pluralRules = new Intl.PluralRules(this.locale)

        this.messages = new Map<string, MessageFunction>(entries)
    }
    
    getMessage(context: InternalValidationContext<unknown>, code: string, constraint: any, message: ConstraintMessage | undefined, level: Level): ConstraintMessage {
        if (message != null)
            return message

        const messageFunction = this.messages.get(`${ context.kind }.${ code }`) ?? this.messages.get(code)
        if (messageFunction == null)
            return `Unexpected error: ${ context.kind }.${ code }`

        return messageFunction({
            context,
            code,
            constraint: {
                raw: constraint,
                formatted: format(constraint, this.numberFormat, this.dateFormat, this.listFormat),
                plural: typeof constraint === "number" ? this.pluralRules.select(constraint) : undefined
            },
            level
        })
    }
}

function s(plural?: Intl.LDMLPluralRule): string {
    return plural == null || plural === "one" ? "" : "s"
}

export const messageProvider_en_US = new BasicMessageProvider("en-US", [
    ["string.min", ({ constraint }) => `Minimum ${ constraint.formatted } character${ s(constraint.plural) }`],
    ["string.max", ({ constraint }) => `Maximum ${ constraint.formatted } character${ s(constraint.plural) }`],
    ["string.match", () => "Invalid format"],

    ["email.min", ({ constraint }) => `Minimum ${ constraint.formatted } character${ s(constraint.plural) }`],
    ["email.max", ({ constraint }) => `Maximum ${ constraint.formatted } character${ s(constraint.plural) }`],
    ["email.match", () => "Invalid email format"],

    ["time.min", ({ constraint }) => `Must be after or equal to ${ constraint.formatted }`],
    ["time.max", ({ constraint }) => `Must be before or equal to ${ constraint.formatted }`],
    ["time.match", () => "Invalid time format"],

    ["number.min", ({ constraint }) => `Must be greater or equal to ${ constraint.formatted }`],
    ["number.max", ({ constraint }) => `Must be less or equal to ${ constraint.formatted }`],

    ["date.min", ({ constraint }) => `Date must be greater or equal to ${ constraint.formatted }`],
    ["date.max", ({ constraint }) => `Date must be less or equal to ${ constraint.formatted }`],

    ["file.min", ({ constraint }) => `File must have a size of at least ${ constraint.formatted } byte${ s(constraint.plural) }`],
    ["file.max", ({ constraint }) => `File must have a size of at most ${ constraint.formatted } byte${ s(constraint.plural) }`],

    ["array.min", ({ constraint }) => `At least ${ constraint.formatted } element${ s(constraint.plural) }`],
    ["array.max", ({ constraint }) => `At most ${ constraint.formatted } element${ s(constraint.plural) }`],

    ["type", ({ constraint }) => `Wrong value type (expected ${ constraint.raw })`],
    ["test", ({ level }) => level === "pending" ? "Pending..." : level === "error" ? "Invalid value" : ""],
    ["oneOf", ({ constraint }) => `Must be one of: ${ constraint.formatted }`],
    ["exists", () => "Required field"],
    ["defined", () => "Required field"],
    ["notnull", () => "Required field"],
    ["required", () => "Required field"]
])

export const messageProvider_fr_FR = new BasicMessageProvider("fr-FR", [
    ["string.min", ({ constraint }) => `Minimum ${ constraint.formatted } caractère${ s(constraint.plural) }`],
    ["string.max", ({ constraint }) => `Maximum ${ constraint.formatted } caractère${ s(constraint.plural) }`],
    ["string.match", () => "Format incorrect"],

    ["email.min", ({ constraint }) => `Minimum ${ constraint.formatted } caractère${ s(constraint.plural) }`],
    ["email.max", ({ constraint }) => `Maximum ${ constraint.formatted } caractère${ s(constraint.plural) }`],
    ["email.match", () => "Format d'email incorrect"],

    ["time.min", ({ constraint }) => `Doit être antérieur ou égal à ${ constraint.formatted }`],
    ["time.max", ({ constraint }) => `Doit être postérieur ou égal à ${ constraint.formatted }`],
    ["time.match", () => "Format horaire incorrect"],

    ["number.min", ({ constraint }) => `Doit être supérieur ou égal à ${ constraint.formatted }`],
    ["number.max", ({ constraint }) => `Doit être inférieur ou égal à ${ constraint.formatted }`],

    ["date.min", ({ constraint }) => `La date doit être égale ou postérieure au ${ constraint.formatted }`],
    ["date.max", ({ constraint }) => `La date doit être égale ou antérieure au ${ constraint.formatted }`],

    ["file.min", ({ constraint }) => `Le fichier doit avoir une taille d'au moins ${ constraint.formatted } octet${ s(constraint.plural) }`],
    ["file.max", ({ constraint }) => `Le fichier doit avoir une taille d'au plus ${ constraint.formatted } octet${ s(constraint.plural) }`],

    ["array.min", ({ constraint }) => `Au moins  ${ constraint.formatted } élément${ s(constraint.plural) }`],
    ["array.max", ({ constraint }) => `Au plus ${ constraint.formatted } élément${ s(constraint.plural) }`],

    ["type", ({ constraint }) => `Valeur du mauvais type (${ constraint.raw } attendu)`],
    ["test", ({ level }) => level === "pending" ? "En cours..." : level === "error" ? "Valeur incorrecte" : ""],
    ["oneOf", ({ constraint }) => `Doit être parmi : ${ constraint.formatted }`],
    ["exists", () => "Champ obligatoire"],
    ["defined", () => "Champ obligatoire"],
    ["notnull", () => "Champ obligatoire"],
    ["required", () => "Champ obligatoire"]
])
