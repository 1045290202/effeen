/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:48
 * @File playground.ts
 * @Description
 */
import { Console, type Context, Effect, Fiber, pipe } from "effect";
import { Effeen } from "../src";
import { Timer } from "../src/Effeen";

export const setTimeOutService: Context.Tag.Service<typeof Timer> = {
    nextTick: Effect.async<number>((resume) => {
        const start = performance.now();
        setTimeout(() => {
            resume(Effect.succeed(performance.now() - start));
        }, 16.66667);
    }),
};

globalThis.requestAnimationFrame ??= (callback) => {
    return setTimeout(callback, 16.66667);
};

export const rafService: Context.Tag.Service<typeof Timer> = {
    nextTick: Effect.async<number>((resume) => {
        const start = performance.now();
        requestAnimationFrame(() => {
            resume(Effect.succeed(performance.now() - start));
        });
    }),
};

export const testServices: Context.Tag.Service<typeof Timer> = {
    nextTick: Effect.succeed(1),
};

const effeen1 = pipe(
    Effeen.effeen({
        aaaa: 100,
        bbbb: "100",
    }),
    Effeen.to(
        100,
        {
            aaaa: 200,
        },
        {
            onUpdate: (self, progress) => {
                // if (progress >= 0.5) {
                //     Fiber.interruptFork(effeen1).pipe(Effect.runSync);
                // }
                return Effect.gen(function* () {
                    const effeen = yield* self;
                    yield* Console.log(effeen, progress);
                    yield* Effect.sleep(100);
                });
            },
        },
    ),
    Effect.provideService(Timer, setTimeOutService),
    // Effect.tap(Effect.log),
    Effect.flatMap(() => {
        return Effeen.effeen({
            cccc: 100,
            dddd: "100",
        });
    }),
    Effeen.to(
        100,
        {
            cccc: 200,
        },
        {
            onUpdate: (_, progress) => {
                // if (progress >= 0.5) {
                //     Fiber.interruptFork(effeen1).pipe(Effect.runSync);
                // }
                return Console.log(progress);
            },
        },
    ),
    Effect.tap((effeen) => {
        console.log(effeen);
    }),
    Effect.provideService(Timer, testServices),
    Effeen.run,
);

setTimeout(() => {
    Fiber.interruptFork(effeen1).pipe(Effect.runSync);
}, 500);
