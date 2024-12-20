import { Constructor } from "../TypesUtil"
import { Yop } from "../Yop"

export function id<Type extends object, Class extends Constructor<Type>>(id: string) {
    return function decorateClass(target: Class, _: ClassDecoratorContext<Class>) {
        Yop.registerClass(id, target)
    }
}
