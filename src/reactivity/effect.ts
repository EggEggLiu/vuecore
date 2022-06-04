import { extend } from "../shared";


let activeEffect;
let shouldTrack;
class ReactiveEffect {
    private _fn: any;
    depsCollect = [];
    active = true;
    onStop?: () => void;

    public scheduler: Function | undefined;
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanUp(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}

function cleanUp(effect) {
    effect.depsCollect.forEach((deps: any) => {
        deps.delete(effect);
    })
    effect.depsCollect.length = 0;
}

const targetMap = new WeakMap();
export function track(target, key) {
    if (!activeEffect || !shouldTrack) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }

    if (deps.has(activeEffect)) return;
    deps.add(activeEffect);
    activeEffect.depsCollect.push(deps);
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const deps = depsMap.get(key);
    deps && deps.forEach(effect => {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    });
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function stop(runner) {
    runner.effect.stop();
}