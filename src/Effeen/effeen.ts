/**
 * @Author 来一斤BUG
 * @Time 2026/6/30 13:55
 * @File effeen.ts
 * @Description
 */
import { Effect } from "effect";
import type { EffectEffeen, EffeenTarget } from "./type.ts";

export class Effeen<T extends EffeenTarget> {
    public target: T;

    constructor(target: T) {
        this.target = target;
    }
}

export const effeen: <T extends EffeenTarget>(target: T) => EffectEffeen<T> = <T extends EffeenTarget>(target: T) => {
    return Effect.succeed(new Effeen(target));
};

export function run<T extends EffeenTarget>(effectEffeen: EffectEffeen<T, never, never>) {
    return effectEffeen.pipe(Effect.runFork);
}
