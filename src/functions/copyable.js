import {wrap} from "../core/wrap";

import {getTeeBuffer} from "./tee";

export const copyable = wrap({
    name: "copyable",
    summary: "Get a copyable sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same contents as the
            input sequence, but that additionally supports copying via its
            \`copy\` method. If the sequence already supported copying, the
            function returns its input sequence.
        `),
        developers: (`
            Uncopyable input sequences are made copyable in the same way that
            @tee produces copies. This means that if the copied sequences will
            be consumed essentially in step with the original, the performance
            and memory impact will be very low; however if the original and
            copies are fully consumed one after the other, the impact will
            be much greater, to the point where it may be preferable to just
            produce an array using the @array method and operate on that instead.
        `),
        returnType: "sequence",
        related: [
            "tee",
        ],
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: function copyable(source){
        if(source.copy){
            return source;
        }else{
            return getTeeBuffer(1, source).sequences[0];
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Some sequences cannot normally be copied, usually because
            // they were created from some root that doesn't itself support
            // copying, such as an ES6 iterator.
            const oneTwoThree = function*(){
                yield 1; yield 2; yield 3;
            };
            const iterSeq = hi(oneTwoThree());
            hi.assertUndefined(iterSeq.copy);
            // The copyable function acquires a copyable sequence from any
            // input, including sequences that don't otherwise support copying.
            // Beware the performance impact! Don't use this when it's not
            // really needed, especially for longer sequences.
            const copySeq = copyable(iterSeq);
            const copied = copySeq.copy();
            hi.assertEqual(copySeq, [1, 2, 3]);
            hi.assertEqual(copied, [1, 2, 3]);
        },
        "emptyInput": hi => {
            const emptyIter = function*(){};
            const seq = hi(emptyIter()).copyable();
            hi.assertEmpty(seq.copy());
            hi.assertEmpty(seq);
        },
        "copyableInput": hi => {
            const seq = hi.range(10);
            hi.assert(hi.isFunction(seq.copy));
            hi.assert(seq.copyable() === seq);
        },
    },
});
