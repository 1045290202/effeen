/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 13:55
 * @File effeen.ts
 * @Description
 */
import { Effect, type Fiber, Scope } from "effect";
import { Registry } from "./registry.ts";
import type { Timer } from "./Timer.ts";
import type { EffectEffeen, EffeenObject } from "./type.ts";

export class Effeen<T extends EffeenObject> {
    public target: T;

    constructor(target: T) {
        this.target = target;
    }
}

export const effeen: <T extends EffeenObject>(target: T) => EffectEffeen<T, never, Timer | Registry | Scope.Scope> = <
    T extends EffeenObject,
>(
    target: T,
) => {
    return Effect.gen(function* () {
        const fiber: Fiber.RuntimeFiber<void | Effeen<T>> = (yield* Effect.withFiberRuntime((f) =>
            Effect.succeed(f),
        )) as Fiber.RuntimeFiber<void | Effeen<T>>;
        const registry = yield* Registry;
        yield* registry.register(target, fiber);

        const scope = yield* Effect.scope;
        yield* Scope.addFinalizer(
            scope,
            Effect.gen(function* () {
                yield* registry.unregister(target, fiber);
            }),
        );
        return new Effeen(target);
    });
};

export function run<T extends EffeenObject, E = never>(
    effectEffeen: Effect.Effect<Effeen<T> | void, E, Scope.Scope>,
): Fiber.RuntimeFiber<void | Effeen<T>, E> {
    return (
        effectEffeen
            .pipe(Effect.scoped)
            // .pipe(Effect.catchAllCause((e) => Effect.logError(e)))
            .pipe(Effect.runFork)
    );
}
