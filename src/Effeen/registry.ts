/**
 * @Author 来一斤BUG
 * @Time 2026/7/1 10:00
 * @File registry.ts
 * @Description Effeen运行Fiber注册表，管理运行中的Fiber并支持打断
 */
import { Context, Effect, Fiber } from "effect";
import type { EffeenObject } from "./type.ts";
import type { Effeen } from "./effeen.ts";

type EffeenFiber<EO extends EffeenObject = EffeenObject> = Fiber.RuntimeFiber<void | Effeen<EO>>;

/**
 * 运行中的Fiber注册表，键为target对象，值为运行中的Fiber集合
 * 使用WeakMap避免内存泄漏，target被垃圾回收时自动清理
 */
const fiberRegistry = new WeakMap<EffeenObject, Set<EffeenFiber>>();

/**
 * 获取某个target的所有运行中的Fiber
 * @param target 目标对象
 * @returns Fiber集合的副本，如果不存在返回空集合
 */
export function getFibers<T extends EffeenObject>(target: T): Set<EffeenFiber> {
    return new Set(fiberRegistry.get(target) ?? []);
}

/**
 * 打断某个target的所有运行中的Effeen
 * @param target 目标对象
 * @returns Effect，中断所有Fiber
 */
export function interruptByTarget<T extends EffeenObject>(target: T) {
    return Effect.gen(function* () {
        const fibers = fiberRegistry.get(target);
        if (!fibers) {
            return Effect.void;
        }
        if (fibers.size === 0) {
            return Effect.void;
        }
        for (const fiber of fibers) {
            yield* Fiber.interruptFork(fiber);
        }
    });
}

/**
 * Registry服务，提供Fiber注册管理功能
 */
export class Registry extends Context.Tag("Registry")<
    Registry,
    {
        readonly register: <T extends EffeenObject>(target: T, fiber: EffeenFiber<T>) => Effect.Effect<void>;
        readonly unregister: <T extends EffeenObject>(target: T, fiber: EffeenFiber<T>) => Effect.Effect<void>;
        readonly getFibers: <T extends EffeenObject>(target: T) => Effect.Effect<Set<EffeenFiber<T>>>;
        readonly interruptByTarget: <T extends EffeenObject>(target: T) => Effect.Effect<void>;
    }
>() {}

/**
 * Registry服务的默认实现
 */
export const RegistryLive = Registry.of({
    register: (target, fiber) =>
        Effect.sync(() => {
            let fibers = fiberRegistry.get(target);
            if (!fibers) {
                fibers = new Set();
                fiberRegistry.set(target, fibers);
            }
            fibers.add(fiber);
        }),
    unregister: (target, fiber) =>
        Effect.sync(() => {
            const fibers = fiberRegistry.get(target);
            if (fibers) {
                fibers.delete(fiber);
                if (fibers.size === 0) {
                    fiberRegistry.delete(target);
                }
            }
        }),
    getFibers: <T extends EffeenObject>(target: T) =>
        Effect.sync((): Set<EffeenFiber<T>> => new Set(fiberRegistry.get(target) ?? []) as Set<EffeenFiber<T>>),
    interruptByTarget: (target) => {
        const fibers = fiberRegistry.get(target);
        if (!fibers || fibers.size === 0) {
            return Effect.void;
        }
        return Effect.forEach(Array.from(fibers), (fiber) => Fiber.interrupt(fiber), { concurrency: "unbounded" }).pipe(
            Effect.asVoid,
        );
    },
});
