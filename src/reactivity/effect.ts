class ReactiveEffect {
    private _fn: any;
    depsCollect = [];
    stopped = false;

    public scheduler: Function | undefined;
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        activeEffect = this;
        const res = this._fn();
        return res;
    }
    stop() {
        if (!this.stopped) {
            cleanUp(this);
            this.stopped = true;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}

function cleanUp(effect) {
    effect.depsCollect.forEach((deps: any) => {
        deps.delete(effect);
    })
}

const targetMap = new WeakMap();
export function track(target, key) {
    if (!activeEffect) return;
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

let activeEffect;
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);

    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function stop(runner) {
    runner.effect.stop();
}