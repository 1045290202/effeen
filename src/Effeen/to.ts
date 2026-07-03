/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:50
 * @File to.ts
 * @Description
 */
import { Effect } from "effect";
import { Timer } from "./Timer.ts";
import type { EffectEffeen, EffeenObject, PartialOf } from "./type.ts";

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const to =
    <T extends EffeenObject, E = never>(
        duration: number,
        params: PartialOf<T, number>,
        options?: {
            onUpdate?: (self: EffectEffeen<T>, progress: number) => Effect.Effect<void, E, Timer>;
        },
    ) =>
    <E2 = never, R2 = never>(effectEffeen: EffectEffeen<T, E2, R2>): EffectEffeen<T, E | E2, Timer | R2> =>
        Effect.gen(function* () {
            const effeen = yield* effectEffeen;
            const timer = yield* Timer;

            const keys = Object.keys(params) as (keyof typeof params)[];
            const starts = Object.fromEntries(keys.map((k) => [k, effeen.target[k] as number])) as Record<
                keyof typeof params,
                number
            >;

            let dtSum: number = 0;
            let progress: number;
            do {
                dtSum += yield* timer.nextTick;
                progress = Math.min(dtSum / duration, 1);

                keys.forEach((k) => {
                    (effeen.target as Record<keyof typeof params, number>)[k] = lerp(
                        starts[k],
                        params[k] as number,
                        progress,
                    );
                });

                const update = options?.onUpdate?.(Effect.succeed(effeen), progress);
                if (update) {
                    yield* update;
                }
            } while (progress < 1);

            return effeen;
        });
