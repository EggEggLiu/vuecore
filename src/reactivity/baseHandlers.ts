import { extend, isObject } from "../shared";
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadOnly = false, isShallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadOnly;
        }

        let res = Reflect.get(target, key);

        if (isShallow) {
            return res;
        }

        if (!isReadOnly) {
            track(target, key);
        }
        if (isObject(res)) {
            res = isReadOnly ? readonly(res) : reactive(res);
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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});