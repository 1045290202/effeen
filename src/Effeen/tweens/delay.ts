/**
 * @Author 来一斤BUG
 * @Time 2026/7/11 18:43
 * @File delay.ts
 * @Description
 */
import { dual } from "effect/Function";
import type { EffectEffeen, EffeenObject } from "../type.ts";
import { Timer } from "../Timer.ts";
import { Effect } from "effect";

export const delay = dual<
    <T extends EffeenObject, E = never>(
        duration: number,
    ) => <E2 = never, R2 = never>(effectEffeen: EffectEffeen<T, E2, R2>) => EffectEffeen<T, E | E2, Timer | R2>,
    <T extends EffeenObject, E = never, E2 = never, R2 = never>(
        effectEffeen: EffectEffeen<T, E2, R2>,
        duration: number,
    ) => EffectEffeen<T, E | E2, Timer | R2>
>(2, (effectEffeen, duration) => {
    return Effect.gen(function* () {
        const effeen = yield* effectEffeen;
        const timer = yield* Timer;

        let countdown: number = duration;
        while (countdown > 0) {
            countdown -= yield* timer.nextTick;
        }

        return effeen;
    });
});
