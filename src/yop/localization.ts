export type ErrorMessages = {
    format?: (value: any) => string
    required?: string
    type?: string
    test?: string
    asyncTest?: string
    oneOf?: string
    matches?: string
    email?: string
    time?: string
    min?: string
    max?: string
}

/* eslint-disable no-template-curly-in-string */

export const en_US_errorMessages: Record<string, ErrorMessages> = {
    all: {
        type: "Wrong value type",
        test: "Invalid value",
        asyncTest: "Invalid value",
        oneOf: "Must be one of: ${oneOfValues}",
        required: "Required field",
    },
    string: {
        min: "Minimum ${min} characters",
        max: "Maximum ${max} characters",
        matches: "Invalid format",
        email: "Invalid email format",
        time: "Invalid time format",
    },
    string$time: {
        min: "Time must not be before ${min}",
        max: "Time must not be after ${max}",
    },
    number: {
        format: (value: number | null | undefined) => value != null ? new Intl.NumberFormat("en-US").format(value) : `${value}`,
        min: "Must be greater or equal to ${min}",
        max: "Must be less or equal to ${max}",
    },
    date: {
        format: (date: Date | null | undefined) => date ? new Intl.DateTimeFormat("en-US").format(date) : `${date}`,
        min: "Date must be greater or equal to ${min}",
        max: "Date must be less or equal to ${max}",
    },
    array: {
        min: "At least ${min} elements",
        max: "At most ${max} elements",
    },
    file: {
        format: (file: File | null | undefined) => file ? file.name : `${file}`,
        min: "File must have a size of at least ${min} bytes",
        max: "File must have a size of at most ${max} bytes",
    }
}

export const fr_FR_errorMessages: Record<string, ErrorMessages> = {
    all: {
        type: "Valeur du mauvais type",
        test: "Valeur incorrecte",
        asyncTest: "Valeur incorrecte",
        oneOf: "Doit être parmi : ${oneOfValues}",
        required: "Champ obligatoire",
    },
    string: {
        min: "Minimum ${min} caractères",
        max: "Maximum ${max} caractères",
        matches: "Format incorrect",
        email: "Format d'email incorrect",
        time: "Format d'heure incorrect",
    },
    string$time: {
        min: "L'heure ne doit pas être avant ${min}",
        max: "L'heure ne doit pas être après ${max}",
    },
    number: {
        format: (value: number | null | undefined) => value != null ? new Intl.NumberFormat("fr-FR").format(value) : `${value}`,
        min: "Doit être supérieur ou égal à ${min}",
        max: "Doit être inférieur ou égal à ${max}",
    },
    date: {
        format: (date: Date | null | undefined) => date ? new Intl.DateTimeFormat("fr-FR").format(date) : `${date}`,
        min: "La date doit être égale ou postérieure au ${min}",
        max: "La date doit être égale ou antérieure au ${max}",
    },
    array: {
        min: "Au moins ${min} éléments",
        max: "Au plus ${max} éléments",
    },
    file: {
        format: (file: File | null | undefined) => file ? file.name : `${file}`,
        min: "Le fichier doit avoir une taille d'au moins ${min} octets",
        max: "Le fichier doit avoir une taille d'au plus ${max} octets",
    }
}
/* eslint-enable no-template-curly-in-string */
