/**
 * @Author 来一斤BUG
 * @Time 2026/7/19 17:52
 * @File quadratic.ts
 * @Description 二次缓动
 */
import type { EasingFunction } from "../type.ts";

/**
 * 二次缓入
 * @param t 时间
 */
export const easeInQuad: EasingFunction = (t: number) => t * t;

/**
 * 二次缓出
 * @param t 时间
 */
export const easeOutQuad: EasingFunction = (t: number) => t * (2 - t);

/**
 * 二次缓过
 * @param t 时间
 */
export const easeInOutQuad: EasingFunction = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
