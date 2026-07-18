/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:48
 * @File playground.ts
 * @Description
 */
import { Console, type Context, Effect, pipe } from "effect";
import { Effeen } from "../src";
import { type EffectEffeen, type EffeenObject, Registry, RegistryLive, Timer } from "../src/Effeen";

export const SetTimeOutTimerLive: Context.Tag.Service<typeof Timer> = Timer.of({
    nextTick: Effect.async<number>((resume) => {
        const start = performance.now();
        setTimeout(() => {
            resume(Effect.succeed(performance.now() - start));
        }, 16.66667);
    }),
});

globalThis.requestAnimationFrame ??= (callback) => {
    return setTimeout(callback, 16.66667);
};

export const RAFTimerLive: Context.Tag.Service<typeof Timer> = Timer.of({
    nextTick: Effect.async<number>((resume) => {
        const start = performance.now();
        requestAnimationFrame(() => {
            resume(Effect.succeed(performance.now() - start));
        });
    }),
});

export const TestTimerLive: Context.Tag.Service<typeof Timer> = Timer.of({
    nextTick: Effect.succeed(1),
});

// ... existing code ...
const logOnUpdateInfo = <T extends EffeenObject>(
    self: EffectEffeen<T>,
    progress: number,
): Effect.Effect<void, never, Timer> =>
    Effect.gen(function* () {
        const effeen = yield* self;
        yield* Console.log(new Date().toISOString(), effeen.target, progress);
    });
// ... existing code ...

const playgrounds: Array<() => Effect.Effect<void, never, never>> = [
    () =>
        Effect.gen(function* () {
            const obj = { aaaa: 100, bbbb: "100", ccc: 500 };

            const fiber = pipe(
                Effeen.effeen(obj),
                Effeen.to(
                    100,
                    {
                        aaaa: 200,
                    },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                ),
                Effect.provideService(Timer, SetTimeOutTimerLive),
                Effect.tap(Console.log),
                Effeen.to(100, {
                    aaaa: 200,
                }),
                Effect.tap(Console.log),
                Effect.provideService(Timer, TestTimerLive),
                Effect.provideService(Registry, RegistryLive),
                Effeen.run,
            );
            yield* fiber;
        }),
    () =>
        Effect.gen(function* () {
            const obj = { aaaa: 100, bbbb: "100", ccc: 500 };

            const fiber = pipe(
                Effeen.effeen(obj),
                Effeen.to(
                    1000,
                    {
                        aaaa: 200,
                    },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                ),
                Effect.provideService(Timer, SetTimeOutTimerLive),
                Effect.provideService(Registry, RegistryLive),
                Effeen.run,
            );

            const interruptFiber = yield* Effect.sleep(100)
                .pipe(Effect.tap(() => Console.log("Sleep done")))
                .pipe(Effect.tap(() => Effeen.interruptByTarget(obj)))
                .pipe(Effect.tap(() => Console.log("Interrupt done")))
                .pipe(Effect.fork);

            yield* Effect.all([fiber, interruptFiber], { concurrency: "unbounded" });
        }),
    () =>
        Effect.gen(function* () {
            yield* Effect.gen(function* () {
                const effeen = Effeen.effeen({ aaaa: 100, bbbb: "100", ccc: 500 });
                yield* Effeen.to(
                    effeen,
                    100,
                    { aaaa: 200 },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                );
                yield* Effeen.to(
                    effeen,
                    5,
                    { ccc: 200 },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                ).pipe(Effect.provideService(Timer, TestTimerLive));
            })
                .pipe(Effect.provideService(Timer, SetTimeOutTimerLive), Effect.provideService(Registry, RegistryLive))
                .pipe(Effeen.run);
        }),
];

Effect.forEach(playgrounds, (fn, index) =>
    Effect.gen(function* () {
        yield* Console.log("\n------------------------------------------------");
        yield* Console.log(`Playing playground ${index + 1}`);
        yield* fn().pipe(Effect.catchAllCause(() => Effect.void));
    }),
).pipe(Effect.runFork);
