/**
 * @Author 来一斤BUG
 * @Time 2026/7/10 22:36
 * @File parallel.ts
 * @Description 并行组合器
 */

import type { EffectEffeen, EffeenObject } from "../type.ts";
import type { Timer } from "../Timer.ts";
import { Effect } from "effect";

export const parallel =
    <T extends EffeenObject, E = never, R = never>(
        ...fns: Array<(effectEffeen: EffectEffeen<T, E, R>) => EffectEffeen<T, E, R | Timer>>
    ) =>
    (effectEffeen: EffectEffeen<T, E, R>): EffectEffeen<T, E, R | Timer> =>
        Effect.gen(function* () {
            const effeen = yield* effectEffeen;
            yield* Effect.all(
                fns.map((fn) => fn(Effect.succeed(effeen))),
                { concurrency: "unbounded" },
            );
            return effeen;
        });
