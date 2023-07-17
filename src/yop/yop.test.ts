import { pick } from "lodash"
import { Yop } from "./Yop"

describe('test.yop', () => {

    Yop.setLocale('fr-FR')

    describe('test.string', () => {

        it('string', () => {
            const schema = Yop.string()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("abc")).toEqual([])
        })
        
        it('string.defined', () => {
            const schema = Yop.string().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("abc")).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('string.required', () => {
            const schema = Yop.string().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate("")).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": "",
            }])
            expect(schema.validate("abc")).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('string.ignored', () => {
            const schema = Yop.string().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('string.min', () => {
            const schema = Yop.string().min(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("abcd")).toEqual([{
                "code": "min",
                "message": "Minimum 5 caractères",
                "path": undefined,
                "value": "abcd",
            }])
            expect(schema.validate("abcde")).toEqual([])
            expect(schema.validate("abcdef")).toEqual([])

            expect(schema.min(5, "Pas assez long (min ${min}) !").validate("abcd")).toEqual([{
                "code": "min",
                "message": "Pas assez long (min 5) !",
                "path": undefined,
                "value": "abcd",
            }])
        })
        
        it('string.max', () => {
            const schema = Yop.string().max(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("abcd")).toEqual([])
            expect(schema.validate("abcde")).toEqual([])
            expect(schema.validate("abcdef")).toEqual([{
                "code": "max",
                "message": "Maximum 5 caractères",
                "path": undefined,
                "value": "abcdef",
            }])

            expect(schema.max(5, "Trop long (max ${max}) !").validate("abcdef")).toEqual([{
                "code": "max",
                "message": "Trop long (max 5) !",
                "path": undefined,
                "value": "abcdef",
            }])
        })
        
        it('string.email', () => {
            const schema = Yop.string().email()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("abc@def.com")).toEqual([])
            
            expect(schema.email("Pas un email ce : ${value}").validate("abc")).toEqual([{
                "code": "email",
                "message": "Pas un email ce : abc",
                "path": undefined,
                "value": "abc",
            }])
        })
        
        it('string.matches', () => {
            const schema = Yop.string().matches(/^(\d){10}$/)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("1234a67890")).toEqual([{
                "code": "matches",
                "message": "Format incorrect",
                "path": undefined,
                "value": "1234a67890",
            }])
            expect(schema.validate("1234567890")).toEqual([])
        })
        
        it('string.oneOf', () => {
            const schema = Yop.string().oneOf(["1", "2"])
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("1")).toEqual([])
            expect(schema.validate("2")).toEqual([])
            expect(schema.validate("3")).toEqual([{
                "code": "oneOf",
                "message": "Doit être parmi : 1, 2",
                "path": undefined,
                "value": "3",
            }])
        })

        it('string.time', () => {
            const schema = Yop.string().time().min("01:00").max("14:30")
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate("")).toEqual([])
            expect(schema.validate("1")).toEqual([{
                "code": "time",
                "message": "Format d'heure incorrect",
                "path": undefined,
                "value": "1",
            }])
            expect(schema.validate("24:68")).toEqual([{
                "code": "time",
                "message": "Format d'heure incorrect",
                "path": undefined,
                "value": "24:68",
            }])
            expect(schema.validate("01:34")).toEqual([])
            expect(schema.validate("01:34:59")).toEqual([])
            expect(schema.validate("01:00")).toEqual([])
            expect(schema.validate("01:00:00")).toEqual([])
            expect(schema.validate("14:30")).toEqual([])
            expect(schema.validate("14:30:00")).toEqual([])
            expect(schema.validate("00:34:59")).toEqual([{
                "code": "min",
                "message": "L'heure ne doit pas être avant 01:00",
                "path": undefined,
                "value": "00:34:59",
            }])
            expect(schema.validate("14:30:01")).toEqual([{
                "code": "max",
                "message": "L'heure ne doit pas être après 14:30",
                "path": undefined,
                "value": "14:30:01",
            }])
        })
    })

    it('string.time.ref', () => {
        type Range = {
            start: string | null
            end: string | null
        }
        const schema = Yop.object<Range>({
            start: Yop.string().defined().time().min("11:00"),
            end: Yop.string().defined().time().min<Range>(context => context.parent!.start)
        })
        expect(schema.validate(null)).toEqual([])
        expect(schema.validate(undefined)).toEqual([])
        expect(schema.validate({ start: "12:00", end: "15:00" })).toEqual([])
        expect(schema.validate({ start: "12:00", end: "12:00" })).toEqual([])
        expect(schema.validate({ start: null, end: "15:00" })).toEqual([])
        expect(schema.validate({ start: "12:00", end: "10:00" })).toEqual([{
            "code": "min",
            "message": "L'heure ne doit pas être avant 12:00",
            "path": "end",
            "value": "10:00",
        }])
    })

    describe('test.number', () => {

        it('number', () => {
            const schema = Yop.number()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])
        })
        
        it('number.defined', () => {
            const schema = Yop.number().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('number.required', () => {
            const schema = Yop.number().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('number.ignored', () => {
            const schema = Yop.number().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('number.min', () => {
            const schema = Yop.number().min(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 5",
                "path": undefined,
                "value": 0,
            }])
            expect(schema.validate(4)).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 5",
                "path": undefined,
                "value": 4,
            }])
            expect(schema.validate(5)).toEqual([])
            expect(schema.validate(6)).toEqual([])

            expect(schema.min(5, "Pas assez grand (min ${min}) !").validate(3)).toEqual([{
                "code": "min",
                "message": "Pas assez grand (min 5) !",
                "path": undefined,
                "value": 3,
            }])
        })
        
        it('number.max', () => {
            const schema = Yop.number().max(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(5)).toEqual([])
            expect(schema.validate(6)).toEqual([{
                "code": "max",
                "message": "Doit être inférieur ou égal à 5",
                "path": undefined,
                "value": 6,
            }])

            expect(schema.max(5, "Trop grand (max ${max}) !").validate(6)).toEqual([{
                "code": "max",
                "message": "Trop grand (max 5) !",
                "path": undefined,
                "value": 6,
            }])
        })
        
        it('number.oneOf', () => {
            const schema = Yop.number().oneOf([1, 2])
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate(2)).toEqual([])
            expect(schema.validate(3)).toEqual([{
                "code": "oneOf",
                "message": "Doit être parmi : 1, 2",
                "path": undefined,
                "value": 3,
            }])
        })
    })

    describe('test.date', () => {

        it('date', () => {
            const schema = Yop.date()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
        })
        
        it('date.defined', () => {
            const schema = Yop.date().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('date.required', () => {
            const schema = Yop.date().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('date.ignored', () => {
            const schema = Yop.date().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('date.min', () => {
            const schema = Yop.date().min(new Date('2022-05-16'))
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date('2022-05-15'))).toEqual([{
                "code": "min",
                "message": "La date doit être égale ou postérieure au 16/05/2022",
                "path": undefined,
                "value": new Date('2022-05-15'),
            }])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
            expect(schema.validate(new Date('2022-05-17'))).toEqual([])

            expect(schema.min(new Date('2022-05-16'), "Pas assez récent (min ${min}) !").validate(new Date('2022-05-15'))).toEqual([{
                "code": "min",
                "message": "Pas assez récent (min 16/05/2022) !",
                "path": undefined,
                "value": new Date('2022-05-15'),
            }])
        })
        
        it('date.max', () => {
            const schema = Yop.date().max(new Date('2022-05-16'))
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date('2022-05-15'))).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
            expect(schema.validate(new Date('2022-05-17'))).toEqual([{
                "code": "max",
                "message": "La date doit être égale ou antérieure au 16/05/2022",
                "path": undefined,
                "value": new Date('2022-05-17'),
            }])

            expect(schema.max(new Date('2022-05-16'), "Trop vieux (max ${max}) !").validate(new Date('2022-05-17'))).toEqual([{
                "code": "max",
                "message": "Trop vieux (max 16/05/2022) !",
                "path": undefined,
                "value": new Date('2022-05-17'),
            }])
        })
    })


    describe('test.boolean', () => {

        it('boolean', () => {
            const schema = Yop.boolean()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])
        })
        
        it('boolean.defined', () => {
            const schema = Yop.boolean().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('boolean.required', () => {
            const schema = Yop.boolean().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('boolean.ignored', () => {
            const schema = Yop.boolean().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('boolean.oneOf', () => {
            const schema = Yop.boolean().oneOf([true])
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate(false)).toEqual([{
                "code": "oneOf",
                "message": "Doit être parmi : true",
                "path": undefined,
                "value": false,
            }])
        })
    })

    describe('test.number', () => {

        it('number', () => {
            const schema = Yop.number()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])
        })
        
        it('number.defined', () => {
            const schema = Yop.number().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('number.required', () => {
            const schema = Yop.number().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(1)).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('number.ignored', () => {
            const schema = Yop.number().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('number.min', () => {
            const schema = Yop.number().min(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 5",
                "path": undefined,
                "value": 0,
            }])
            expect(schema.validate(4)).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 5",
                "path": undefined,
                "value": 4,
            }])
            expect(schema.validate(5)).toEqual([])
            expect(schema.validate(6)).toEqual([])

            expect(schema.min(5, "Pas assez grand (min ${min}) !").validate(3)).toEqual([{
                "code": "min",
                "message": "Pas assez grand (min 5) !",
                "path": undefined,
                "value": 3,
            }])
        })
        
        it('number.max', () => {
            const schema = Yop.number().max(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(0)).toEqual([])
            expect(schema.validate(5)).toEqual([])
            expect(schema.validate(6)).toEqual([{
                "code": "max",
                "message": "Doit être inférieur ou égal à 5",
                "path": undefined,
                "value": 6,
            }])

            expect(schema.max(5, "Trop grand (max ${max}) !").validate(6)).toEqual([{
                "code": "max",
                "message": "Trop grand (max 5) !",
                "path": undefined,
                "value": 6,
            }])
        })
        
        it('number.oneOf', () => {
            const schema = Yop.number().oneOf([1, 2])
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate(2)).toEqual([])
            expect(schema.validate(3)).toEqual([{
                "code": "oneOf",
                "message": "Doit être parmi : 1, 2",
                "path": undefined,
                "value": 3,
            }])
        })
    })

    describe('test.date', () => {

        it('date', () => {
            const schema = Yop.date()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
        })
        
        it('date.defined', () => {
            const schema = Yop.date().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('date.required', () => {
            const schema = Yop.date().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(new Date())).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('date.ignored', () => {
            const schema = Yop.date().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('date.min', () => {
            const schema = Yop.date().min(new Date('2022-05-16'))
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date('2022-05-15'))).toEqual([{
                "code": "min",
                "message": "La date doit être égale ou postérieure au 16/05/2022",
                "path": undefined,
                "value": new Date('2022-05-15'),
            }])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
            expect(schema.validate(new Date('2022-05-17'))).toEqual([])

            expect(schema.min(new Date('2022-05-16'), "Pas assez récent (min ${min}) !").validate(new Date('2022-05-15'))).toEqual([{
                "code": "min",
                "message": "Pas assez récent (min 16/05/2022) !",
                "path": undefined,
                "value": new Date('2022-05-15'),
            }])
        })
        
        it('date.max', () => {
            const schema = Yop.date().max(new Date('2022-05-16'))
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(new Date('2022-05-15'))).toEqual([])
            expect(schema.validate(new Date('2022-05-16'))).toEqual([])
            expect(schema.validate(new Date('2022-05-17'))).toEqual([{
                "code": "max",
                "message": "La date doit être égale ou antérieure au 16/05/2022",
                "path": undefined,
                "value": new Date('2022-05-17'),
            }])

            expect(schema.max(new Date('2022-05-16'), "Trop vieux (max ${max}) !").validate(new Date('2022-05-17'))).toEqual([{
                "code": "max",
                "message": "Trop vieux (max 16/05/2022) !",
                "path": undefined,
                "value": new Date('2022-05-17'),
            }])
        })
    })


    describe('test.boolean', () => {

        it('boolean', () => {
            const schema = Yop.boolean()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])
        })
        
        it('boolean.defined', () => {
            const schema = Yop.boolean().defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('boolean.required', () => {
            const schema = Yop.boolean().required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate(false)).toEqual([])
            expect(schema.validate(true)).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('boolean.ignored', () => {
            const schema = Yop.boolean().required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
        
        it('boolean.oneOf', () => {
            const schema = Yop.boolean().oneOf([true])
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate(false)).toEqual([{
                "code": "oneOf",
                "message": "Doit être parmi : true",
                "path": undefined,
                "value": false,
            }])
        })
    })

    describe('test.object', () => {

        it('object', () => {
            const schema = Yop.object({})
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })
       
        it('object.requiredIf', () => {
            const schema = Yop.object({
                name: Yop.string(),
                age: Yop.number().requiredIf(context => context.parent.name === 'Joe')
            })
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate({
                name: 'Jack'
            })).toEqual([])
            expect(schema.validate({
                name: 'Joe'
            })).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "age",
                "value": undefined
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 23
            })).toEqual([])
        })
       
        it('object.test.child', () => {
            const schema = Yop.object({
                name: Yop.string(),
                age: Yop.number().test(context => (context.parent.name !== 'Joe' || context.value === 10), "Joe doit avoir 10 ans")
            })
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate({
                name: 'Jack'
            })).toEqual([])
            expect(schema.validate({
                name: 'Joe'
            })).toEqual([{
                "code": "test",
                "message": "Joe doit avoir 10 ans",
                "path": "age",
                "value": undefined
            }])
            expect(schema.validate({
                name: 'Joe',
                age: null
            })).toEqual([{
                "code": "test",
                "message": "Joe doit avoir 10 ans",
                "path": "age",
                "value": null
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 9
            })).toEqual([{
                "code": "test",
                "message": "Joe doit avoir 10 ans",
                "path": "age",
                "value": 9
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 10
            })).toEqual([])
        })
        
        it('object.test.reference', () => {
            const schema = Yop.object({
                name: Yop.string(),
                age: Yop.number().min(context => context.parent.name.length)
            })
            expect(schema.validate({
                name: 'Joe',
                age: 2
            })).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 3",
                "path": "age",
                "value": 2
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 3
            })).toEqual([])
        })
        
        it('object.test', () => {
            const schema = Yop.object({
                name: Yop.string().required(),
                age: Yop.number().required()
            }).test(
                context => context.value!.age > context.value!.name.length,
                "L'âge doit être supérieur à la longueur du nom"
            )
            expect(schema.validate({
                name: 'Joe'
            })).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "age",
                "value": undefined,
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 2
            })).toEqual([{
                "code": "test",
                "message": "L'âge doit être supérieur à la longueur du nom",
                "path": undefined,
                "value": {
                    name: 'Joe',
                    age: 2
                }
            }])
            expect(schema.validate({
                name: 'Joe',
                age: 4
            })).toEqual([])
        })
       
        it('object.ignoredIf', () => {
            const schema = Yop.object({
                name: Yop.string(),
                age: Yop.number().required().min(5).ignoredIf(context => context.parent.name === 'Joe')
            })
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate({
                name: 'Joe'
            })).toEqual([])
            expect(schema.validate({
                name: 'Joe',
                age: 6
            })).toEqual([])
            expect(schema.validate({
                name: 'Jack'
            })).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "age",
                "value": undefined
            }])
            expect(schema.validate({
                name: 'Jack',
                age: 1
            })).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 5",
                "path": "age",
                "value": 1
            }])
            expect(schema.validate({
                name: 'Jack',
                age: 5
            })).toEqual([])
        })

        it('object.ignored', () => {
            const schema = Yop.object({ name: Yop.string() }).required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })

        interface A {
            name: string
        }

        it('object.ignoredSchema', () => {
            const schema = Yop.object<A>({ name: Yop.ignored() })
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate({})).toEqual([])
            expect(schema.validate({ name: null })).toEqual([])
            expect(schema.validate({ name: undefined })).toEqual([])
            expect(schema.validate({ name: "abc" })).toEqual([])
        })

        it('object.validateAt', () => {
            const schema = Yop.object({
                parent: Yop.object({
                    child: Yop.string().required().min(5)
                }).required()
            })
            expect(schema.validateAt('parent.child', {
                parent: {
                    child: "12345"
                }
            })).toEqual([])
            expect(schema.validateAt('parent.child', {
                parent: {
                }
            })).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "parent.child",
                "value": undefined,
            }])
            expect(schema.validateAt('parent.child', {
                parent: {
                    child: "123"
                }
            })).toEqual([{
                "code": "min",
                "message": "Minimum 5 caractères",
                "path": "parent.child",
                "value": "123",
            }])
            expect(schema.validateAt('', {
                parent: {
                    child: "123"
                }
            })).toEqual([{
                "code": "min",
                "message": "Minimum 5 caractères",
                "path": "parent.child",
                "value": "123",
            }])
            expect(schema.validateAt('parent', {
                parent: {
                    child: "123"
                }
            })).toEqual([{
                "code": "min",
                "message": "Minimum 5 caractères",
                "path": "parent.child",
                "value": "123",
            }])
            expect(schema.validateAt('parent', {
            })).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "parent",
                "value": undefined,
            }])
            expect(schema.validateAt('parent.children', {
                parent: {
                    child: "123"
                }
            })).toBeNull()
        })

        it('object.schemaAt', () => {
            const schema = Yop.object({
                age: Yop.number(),
                parent: Yop.object({
                    child: Yop.string().required().min(5).when(context => context.root.age === 5 ? context.schema.max(9) : null)
                }).required()
            })
            expect(pick(schema.schemaAt('parent.child', {
                parent: {
                    child: "12345"
                }
            })?.constraints, ['nullable', 'optional', 'min', 'max', 'regex'])).toEqual({
                "min": {"message": undefined, "value": 5},
                "nullable": {"message": undefined, "value": false},
                "optional": {"message": undefined, "value": false},
            })
            expect(pick(schema.schemaAt('parent.child', {
                age: 5,
                parent: {
                    child: "12345"
                }
            })?.constraints, ['nullable', 'optional', 'min', 'max', 'regex'])).toEqual({
                "min": {"message": undefined, "value": 5},
                "max": {"message": undefined, "value": 9},
                "nullable": {"message": undefined, "value": false},
                "optional": {"message": undefined, "value": false},
            })
        })

        it('object.focusOn', () => {
            const schema = Yop.object({
                children: Yop.array(Yop.number().min(1))
            }).required()
            expect(schema.validate({
                children: [0, 1, 2]
            })).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 1",
                "path": "children[0]",
                "value": 0,
            }])
            expect(schema.focusOn("children[0]").validate({
                children: [0, 1, 2]
            })).toEqual([{
                "code": "min",
                "message": "Doit être supérieur ou égal à 1",
                "path": "children[0]",
                "value": 0,
            }])
            expect(schema.focusOn("children[1]").validate({
                children: [0, 1, 2]
            })).toEqual([])

            expect(schema.focusOn("children[2]").validate({
                children: [0, 1, 2]
            })).toEqual([])
        })
    })

    describe('test.array', () => {

        it('array', () => {
            const schema = Yop.array(Yop.number())
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate([])).toEqual([])
            expect(schema.validate([1, 2, 3])).toEqual([])
            expect(schema.validate(["1", "2"])).toEqual([{
                "code": "type",
                "message": "Valeur du mauvais type",
                "path": "[0]",
                "value": "1",
            }, {
                "code": "type",
                "message": "Valeur du mauvais type",
                "path": "[1]",
                "value": "2",
            }])
        })
        
        it('array.defined', () => {
            const schema = Yop.array(Yop.string()).defined()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate([""])).toEqual([])
            expect(schema.validate(["", null, undefined])).toEqual([])

            expect(schema.defined("Pas d'${value} !").validate(undefined)).toEqual([{
                "code": "required",
                "message": "Pas d'undefined !",
                "path": undefined,
                "value": undefined,
            }])
        })
        
        it('array.required', () => {
            const schema = Yop.array(Yop.string()).required()
            expect(schema.validate(null)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": null,
            }])
            expect(schema.validate(undefined)).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": undefined,
                "value": undefined,
            }])
            expect(schema.validate([""])).toEqual([])
            expect(schema.validate(["", null, undefined])).toEqual([])

            expect(schema.required("Pas de ${value} !").validate(null)).toEqual([{
                "code": "required",
                "message": "Pas de null !",
                "path": undefined,
                "value": null,
            }])
        })

        it('array.ignored', () => {
            const schema = Yop.array(Yop.string()).required().ignored()
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate(1)).toEqual([])
            expect(schema.validate("abc")).toEqual([])
            expect(schema.validate(true)).toEqual([])
            expect(schema.validate({})).toEqual([])
        })

        it('array.min', () => {
            const schema = Yop.array(Yop.number()).min(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate([])).toEqual([{
                "code": "min",
                "message": "Au moins 5 éléments",
                "path": undefined,
                "value": [],
            }])
            expect(schema.validate([1, 2, 3, 4])).toEqual([{
                "code": "min",
                "message": "Au moins 5 éléments",
                "path": undefined,
                "value": [1, 2, 3, 4],
            }])
            expect(schema.validate([1, 2, 3, 4, 5])).toEqual([])
            expect(schema.validate([1, 2, 3, 4, 5, 6])).toEqual([])

            expect(schema.min(5, "Pas assez de nombres (min ${min}) !").validate([1])).toEqual([{
                "code": "min",
                "message": "Pas assez de nombres (min 5) !",
                "path": undefined,
                "value": [1],
            }])
        })
        
        it('array.max', () => {
            const schema = Yop.array(Yop.number()).max(5)
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate([])).toEqual([])
            expect(schema.validate([1, 2, 3, 4])).toEqual([])
            expect(schema.validate([1, 2, 3, 4, 5])).toEqual([])
            expect(schema.validate([1, 2, 3, 4, 5, 6])).toEqual([{
                "code": "max",
                "message": "Au plus 5 éléments",
                "path": undefined,
                "value": [1, 2, 3, 4, 5, 6],
            }])

            expect(schema.max(5, "Trop de nombres (max ${max}) !").validate([1, 2, 3, 4, 5, 6, 7])).toEqual([{
                "code": "max",
                "message": "Trop de nombres (max 5) !",
                "path": undefined,
                "value": [1, 2, 3, 4, 5, 6, 7],
            }])
        })

                
        it('array.test', () => {
            const schema = Yop.array(Yop.number().required()).test(context => context.value![0] === 1 && context.value![1] === 2, "Doit contenir 1 puis 2")
            expect(schema.validate(null)).toEqual([])
            expect(schema.validate(undefined)).toEqual([])
            expect(schema.validate([])).toEqual([{
                "code": "test",
                "message": "Doit contenir 1 puis 2",
                "path": undefined,
                "value": [],
            }])
            expect(schema.validate([null, 2])).toEqual([{
                "code": "required",
                "message": "Champ obligatoire",
                "path": "[0]",
                "value": null
            }])
            expect(schema.validate([1, 2])).toEqual([])
            expect(schema.validate([1, 2, 3])).toEqual([])
            expect(schema.validate([2, 1])).toEqual([{
                "code": "test",
                "message": "Doit contenir 1 puis 2",
                "path": undefined,
                "value": [2, 1],
            }])
        })

        interface Child {
            name: string
        }

        interface Parent {
            children: Child[]
        }

        it('array.typed', () => {
            const schema = Yop.object<Parent>({
                children: Yop.array(Yop.object({
                    name: Yop.string().required()
                })).required()
            })
            expect(schema.validate({
                children: [{
                    name: 'Joe'
                },{
                    name: 'Jack'
                },]
            })).toEqual([])
        })
    })

    describe('test.errors', () => {

        it('errors', () => {
            expect(() =>
                Yop.string().test(context => true).test(context => false)
            ).toThrowError("Yop doesn't allow multiple test conditions!")
            expect(() =>
                Yop.string().ignoredIf(context => true).ignoredIf(context => false)
            ).toThrowError("Yop doesn't allow multiple ignoredIf conditions!")
            expect(() =>
                Yop.string().requiredIf(context => true).requiredIf(context => false)
            ).toThrowError("Yop doesn't allow multiple requiredIf conditions!")
            expect(() =>
                Yop.string().when(context => context.schema.required()).when(context => context.schema.ignored())
            ).toThrowError("Yop doesn't allow multiple when conditions!")
            expect(() =>
                Yop.string().constraints.ignored = true
            ).toThrowError("Cannot assign to read only property 'ignored' of object '#<SchemaConstraints>'")
        })
    })
})