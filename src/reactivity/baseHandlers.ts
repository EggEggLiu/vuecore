import { track, trigger } from "./effect"

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadOnly = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (!isReadOnly) {
            track(target, key);
        }
        return res;
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    }
}

export const mutableHandlers = {
    get,
    set,
};

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`Key-${key} cannot be set, cuz Object-${target} is readonly!`);
        return true;
    }
};