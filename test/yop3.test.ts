import { describe, it, expect } from 'vitest'
import { validate } from '../src/yop3/Yop'

describe('test.yop3', () => {

    // Yop.setLocale('fr-FR')

    describe('test.string', () => {
        
        const errors = validate(["string", {
            required: true,
            min: (context) => context ? 5 : 10,
            max: 10,
            match: (context) => /^abc/,
        }], "1234567")
        console.log(errors)
    
    })
})