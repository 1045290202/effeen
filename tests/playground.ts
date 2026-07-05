/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:48
 * @File playground.ts
 * @Description
 */
import { Console, type Context, Effect, pipe } from "effect";
import { Effeen } from "../src";
import { Registry, RegistryLive, Timer } from "../src/Effeen";
import type { EffeenObject, EffectEffeen } from "../src/Effeen";

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

/**
 * parallel组合器 - 柯里化设计
 * parallel(...fns) 返回一个接受 effectEffeen 的函数
 * 对每个fn应用该effectEffeen后并行执行，返回第一个结果
 */
const parallel =
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

const obj = { aaaa: 100, bbbb: "100", ccc: 500 };

/*const effeen1 = */ pipe(
    Effeen.effeen(obj),
    Effeen.to(
        1000,
        {
            aaaa: 200,
        },
        {
            onUpdate: (self, progress) =>
                Effect.gen(function* () {
                    const effeen = yield* self;
                    yield* Console.log(effeen.target, progress);
                    // yield* Effect.fail("Error");
                    // yield* Effect.sleep(100);
                }),
        },
    ),
    Effect.provideService(Timer, SetTimeOutTimerLive),
    // Effect.tap(Effect.log),
    parallel(Effeen.to(100, { aaaa: 200 }), Effeen.to(100, { ccc: 200 })),
    Effect.tap((effeen) => {
        console.log(effeen);
    }),
    Effect.provideService(Timer, TestTimerLive),
    Effect.provideService(Registry, RegistryLive),
    Effeen.run,
);

setTimeout(() => {
    // Fiber.interruptFork(effeen1).pipe(Effect.runSync);
    // Effeen.interruptByTarget(obj).pipe(Effect.runSync);
}, 100);
