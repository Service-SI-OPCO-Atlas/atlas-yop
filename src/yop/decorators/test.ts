import { TestConstraintFunction } from "../constraints/TestConstraint"
import { initClassConstraints } from "../Metadata"
import { Constructor } from "../TypesUtil"

type InstanceType<Class> = Class extends Constructor<infer Type> ? Type : never

export function test<Class extends Constructor>(test: TestConstraintFunction<InstanceType<Class>>) {
    return function decorateClass(_: Class, context: ClassDecoratorContext<Class>) {
        const classConstraints = initClassConstraints(context.metadata)
        classConstraints.test = test
    }
}
