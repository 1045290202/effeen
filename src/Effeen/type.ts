/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 14:52
 * @File type.ts
 * @Description
 */
import type { Effect } from "effect";
import type { Effeen } from "./effeen.ts";
import type { Timer } from "./Timer.ts";

export type EffeenObject = object;
export type EffectEffeen<T extends EffeenObject, E = never, R = Timer> = Effect.Effect<Effeen<T>, E, R>;

type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
export type PartialOf<T, V> = Partial<Pick<T, KeysOfType<T, V>>>;

/**
 * 缓动函数
 */
export type EasingFunction = (t: number) => number;
