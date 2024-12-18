import { describe, it } from 'vitest'
import { string } from '../src/yop3/decorators/string'
import { number } from '../src/yop3/decorators/number'
import { boolean } from '../src/yop3/decorators/boolean'
import { date } from '../src/yop3/decorators/date'
import { instance } from '../src/yop3/decorators/instance'
import { Yop } from '../src/yop3/Yop'
import { file } from '../src/yop3/decorators/file'
import { email } from '../src/yop3/decorators/email'
import { array } from '../src/yop3'
import { type } from '../src/yop3/decorators/type'

class Pet {
    @string({ required: true, min: 1 })
    name: string | null = null
}

function x() {
    return @type({ id: "Fuck", required: true }) class extends Pet {}
}

describe('test.yop3', () => {

    describe('test.string', () => {

        it('string', () => {

            class Dog extends Pet {
                @string({ required: true, min: 2 })
                food: string | null = null
            }

            @type({ id: "Person" })
            class Person {

                @string({ exists: true })
                dummy: string | null = null

                @string({
                    required: context => context.parent.email != null,
                    min: 2,
                    max: 20,
                    match: /^[a-zA-Z_]+$/
                })
                firstName: string | null = null
                
                @string({
                    required: context => context.parent.firstName != null,
                    // min: [2, "Le nom de famille doit avoir au moins un caratère"],
                    min: [2, context => context.parent.firstName != null ? "Le nom de famille doit avoir au moins un caratère lorsque le prénom est renseigné" : undefined],
                })
                lastName: string | null = null
                
                @email({ required: true, match: [, "Invalid email"] })                
                email: string | null = null
                
                @number({ required: false, min: _context => 18, max: 100 })                
                age: number | null = null

                @boolean({ required: true, oneOf: [[true], "Doit être vrai"] })
                female: boolean | null = null

                @string({ required: true, oneOf: ["male", "female"] })
                gender: "male" | "female" | "other" | null = null

                @date({ required: true, min: new Date(1900, 0, 1) })
                birthDate: Date | null = null

                @array({ of: Dog, required: _context => true })
                pets: Pet[] = null as any

                @array({
                    required: true,
                    min: 2,
                    of: string({ required: true, min: 2, max: 20 }),
                })
                names: string[] = null as any

                @instance({
                    of: "Person",
                    required: true,
                })
                friend: Person | null = null

                @array({
                    required: true,
                    of: instance({ of: "Person", required: true })
                })
                friends: Person[] = null as any

                @file({ required: true })
                doc: File | null = null
            }

            // // const p: (new (...args: any[]) => object) = Person

            console.log("validate", Yop.validate(Person, {
                dummy: undefined,
                firstName: "12345678901234567890",
                lastName: "1",
                email: "test",
                female: false,
                gender: "other",
                age: 12,
                birthDate: new Date(1899, 0, 1),
                friend: null, //new Person(),
                pets: [{ name: "a", food: "b" }],
                names: ["ab", null, "c"],
                friends: [{ firstName: "a", lastName: "b" }, null]
            }))

            const y = x()
            console.log(y)


            // // const s = strings({ required: (context) => true, min: 2, max: 20 })
            // // console.log(s)
            // // console.log(Person[(Symbol as any).metadata])
        })
    })
})