import {isSequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const write = wrap({
    name: "write",
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [wrap.expecting.boundedSequence, wrap.expecting.array],
    },
    implementation: (source, target) => {
        if(isSequence(source) && source.root() === target){
            return source.collapse();
        }
        let i = 0;
        while(!source.done() && i < target.length){
            target[i++] = source.nextFront();
        }
        while(!source.done()){
            target.push(source.nextFront());
        }
        return target;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [];
            const square = i => i * i;
            hi.map([1, 2, 3, 4], square).write(array);
            hi.assertEqual(array, [1, 4, 9, 16]);
        },
        "writeToRoot": hi => {
            const array = [1, 2, 3, 4];
            const square = i => i * i;
            hi.map(array, square).write(array);
            hi.assertEqual(array, [1, 4, 9, 16]);
        },
    },
});

export default write;
