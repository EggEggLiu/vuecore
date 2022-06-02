import { mutableHandlers, readonlyHandlers } from "./baseHandlers";
import { track, trigger } from "./effect"

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly",
};

export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}

function createActiveObject(raw: any, handlers) {
    return new Proxy(raw, handlers);
}

export function isReactive(value) {
    // 访问对象的预设key来确认是否进入对应的getter
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}