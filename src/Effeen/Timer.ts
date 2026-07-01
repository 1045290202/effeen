/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 17:00
 * @File Timer.ts
 * @Description 基于 Effect Context.Tag 的帧定时服务，随 Effect 链传递，支持 RAF / 自定义时钟替换
 */
import { Context, type Effect } from "effect";

/**
 * 帧定时服务 Context.Tag。
 * 每次 yield nextTick 等待下一帧并返回当前绝对时间戳（ms，performance.now 语义）。
 * 消费端自行计算两次 nextTick 之间的 delta。
 */
export class Timer extends Context.Tag("Timer")<Timer, { readonly nextTick: Effect.Effect<number> }>() {}
