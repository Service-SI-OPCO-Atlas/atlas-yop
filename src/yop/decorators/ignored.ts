import { fieldValidationDecorator } from "../Metadata"

export function ignored() {
    return fieldValidationDecorator("ignored", {}, {}, () => true)
}
