import { isReadonly, readonly, shallowReadonly } from "../reactive";

describe("readonly", () => {
    it("happy path", () => {
        // basic readonly obj initial
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapper = readonly(original);
        expect(wrapper).not.toBe(original);
        expect(isReadonly(wrapper)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(wrapper.bar)).toBe(true);
        expect(isReadonly(original.bar)).toBe(false);
        expect(wrapper.foo).toBe(1);
    });

    it("warn while call set", () => {
        console.warn = jest.fn();
        const user = readonly({
            age: 10,
        });
        user.age = 18;
        expect(console.warn).toBeCalled();
    });
});

describe("shallowReadonly", () => {
    test("happy path", () => {
        const obj = shallowReadonly({ foo: { bar: 1 } });
        expect(isReadonly(obj)).toBe(true);
        expect(isReadonly(obj.foo)).toBe(false);
        console.warn = jest.fn();
        obj.foo = 0;
        expect(console.warn).toBeCalled();
    })
});