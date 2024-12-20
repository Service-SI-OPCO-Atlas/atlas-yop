import { Constructor } from "../types"
import { Yop } from "../Yop"

export function classId<Type extends object, Class extends Constructor<Type>>(id: string) {
    return function decorateClass(target: Class, _: ClassDecoratorContext<Class>) {
        Yop.registerClass(id, target)
    }
}
