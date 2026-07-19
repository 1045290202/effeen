/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:50
 * @File to.ts
 * @Description
 */
import { dual } from "effect/Function";
import { Array, Effect } from "effect";
import { Timer } from "../Timer.ts";
import type { EasingFunction, EffectEffeen, EffeenObject, PartialOf } from "../type.ts";
import { linear } from "../easings";

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export type ToOptions<T extends EffeenObject, E> = {
    easing?: EasingFunction;
    onUpdate?: (self: EffectEffeen<T>, progress: number) => Effect.Effect<void, E, Timer>;
};

export const to = dual<
    // DataLast 签名（柯里化）
    <T extends EffeenObject, E = never>(
        duration: number,
        params: PartialOf<T, number>,
        options?: ToOptions<T, E>,
    ) => <E2 = never, R2 = never>(effectEffeen: EffectEffeen<T, E2, R2>) => EffectEffeen<T, E | E2, Timer | R2>,
    // DataFirst 签名（非柯里化）
    <T extends EffeenObject, E = never, E2 = never, R2 = never>(
        effectEffeen: EffectEffeen<T, E2, R2>,
        duration: number,
        params: PartialOf<T, number>,
        options?: ToOptions<T, E>,
    ) => EffectEffeen<T, E | E2, Timer | R2>
>(4, (effectEffeen, duration, params, options) => {
    return Effect.gen(function* () {
        const effeen = yield* effectEffeen;
        const timer = yield* Timer;

        const keys = Object.keys(params) as (keyof typeof params)[];
        const starts = Object.fromEntries(keys.map((k) => [k, effeen.target[k] as number])) as Record<
            keyof typeof params,
            number
        >;

        const easing: EasingFunction = options?.easing ?? linear;

        let dtSum: number = 0;
        let progress: number;
        do {
            dtSum += yield* timer.nextTick;
            progress = Math.min(dtSum / duration, 1);
            const easedProgress: number = easing(progress);

            Array.forEach(keys, (k) => {
                (effeen.target as Record<keyof typeof params, number>)[k] = lerp(
                    starts[k],
                    params[k] as number,
                    easedProgress,
                );
            });

            const update = options?.onUpdate?.(Effect.succeed(effeen), easedProgress);
            if (update) {
                yield* update;
            }
        } while (progress < 1);

        return effeen;
    });
});
