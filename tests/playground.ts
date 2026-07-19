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

/**
 * 固定时间间隔的定时器（17毫秒）
 * 用于测试时快速推进动画，不依赖真实时间流逝
 */
export const FixedTick17Timer: Context.Tag.Service<typeof Timer> = Timer.of({
    nextTick: Effect.succeed(17),
});

/**
 * 固定时间间隔的定时器（1毫秒）
 * 用于测试时快速推进动画，不依赖真实时间流逝
 */
export const FixedTick1Timer: Context.Tag.Service<typeof Timer> = Timer.of({
    nextTick: Effect.succeed(1),
});

const currentTime = () => new Date().toISOString();

/**
 * 打印更新信息
 * @param self
 * @param progress
 */
const logOnUpdateInfo = <T extends EffeenObject>(
    self: EffectEffeen<T>,
    progress: number,
): Effect.Effect<void, never, Timer> =>
    Effect.gen(function* () {
        const effeen = yield* self;
        yield* Console.log(currentTime(), "target:", effeen.target, "progress:", progress);
    });

const playgrounds: Array<() => Effect.Effect<void, never, never>> = [
    () =>
        Effect.gen(function* () {
            yield* pipe(
                Effeen.effeen({ aaaa: 100 }),
                Effeen.Tween.to(
                    100,
                    {
                        aaaa: 200,
                    },
                    {
                        easing: Effeen.Easing.easeInQuad,
                        onUpdate: logOnUpdateInfo,
                    },
                ),
                Effect.provideService(Timer, FixedTick17Timer),
                Effect.provideService(Registry, RegistryLive),
                Effeen.run,
            );
        }),
    () =>
        Effect.gen(function* () {
            const obj = { aaaa: 100 };

            const fiber = pipe(
                Effeen.effeen(obj),
                Effeen.Tween.to(
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
                .pipe(Effect.tap(() => Console.log(currentTime(), "Sleep done")))
                .pipe(Effect.tap(() => Effeen.interruptByTarget(obj)))
                .pipe(Effect.tap(() => Console.log(currentTime(), "Interrupt done")))
                .pipe(Effect.fork);

            yield* Effect.all([fiber, interruptFiber], { concurrency: "unbounded" });
        }),
    () =>
        Effect.gen(function* () {
            yield* Effect.gen(function* () {
                const effeen = Effeen.effeen({ aaaa: 100, bbb: 1000, ccc: 500 });
                yield* Effeen.Tween.to(
                    effeen,
                    100,
                    { aaaa: 200 },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                );
                yield* Console.log();
                yield* Effeen.Tween.to(
                    effeen,
                    5,
                    { bbb: 300, ccc: 200 },
                    {
                        onUpdate: logOnUpdateInfo,
                    },
                ).pipe(Effect.provideService(Timer, FixedTick1Timer));
            })
                .pipe(Effect.provideService(Timer, FixedTick17Timer))
                .pipe(Effect.provideService(Registry, RegistryLive))
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
