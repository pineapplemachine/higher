import {wrap} from "../core/wrap";

import {EagerSequence} from "./eager";
import {FinitePadRightSequence, InfinitePadRightSequence} from "./padRightCount";

export const PadRightOnDemandSequence = function(source, targetLength, element){
    return new OnDemandSequence(FinitePadRightSequence.appliedTo(ArraySequence), {
        bounded: () => source.bounded(),
        unbounded: () => false, // Do not call this function with unbounded inputs
        done: () => source.done() && targetLength === 0,
        front: () => source.done() ? element : source.front(),
        dump: () => {
            const array = [];
            for(const element of source) array.push(element);
            const arraySequence = new ArraySequence(array);
            if(array.length >= targetLength){
                return arraySequence;
            }else{
                return new FinitePadRightSequence(
                    arraySequence, element, array.length - targetLength
                );
            }
        },
    });
};

export const padRight = wrap({
    name: "padRight",
    summary: "Satisfy a length requirement by padding the back of a sequence with some repeated element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
        related: [
            "padLeft", "padRightCount",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.either(
                wrap.expecting.unboundedSequence,
                wrap.expecting.knownLengthSequence
            ),
            wrap.expecting.number,
            wrap.expecting.anything,
        ],
    },
    implementation: (source, targetLength, element) => {
        if(targetLength <= 0 || source.unbounded()){
            return source;
        }else if(isFinite(targetLength)){
            if(source.nativeLength){
                const sourceLength = source.length();
                if(sourceLength >= targetLength){
                    return source;
                }else{
                    return new FinitePadRightSequence(
                        source, element, targetLength - sourceLength
                    );
                }
            }else{ // Argument validation implies source.bounded()
                return PadRightOnDemandSequence(source, targetLength, element);
            }
        }else{
            return new InfinitePadRightSequence(source, element);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi("123").padRight(5, "0"), "12300");
        },
        "numericInput": hi => {
            hi.assertEqual(hi([1, 2, 3]).padRight(6, 0), [1, 2, 3, 0, 0, 0]);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().padRight(3, "!"), "!!!");
        },
        "longerInputThanTargetLength": hi => {
            hi.assertEqual(hi("beep").padRight(4, "_"), "beep");
            hi.assertEqual(hi("hello").padRight(3, "_"), "hello");
            hi.assertEqual(hi("!").padRight(1, "_"), "!");
            hi.assertEqual(hi("abc").padRight(0, "_"), "abc");
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("abc").padRight(2, "!");
            hi.assert(seq.startsWith("abcabcabc"));
            hi.assert(seq.endsWith("abcabcabc"));
        },
        "padBoundedInfinitely": hi => {
            const seq = hi("hello").padRight(Infinity, "_");
            hi.assert(seq.startsWith("hello_________"));
            hi.assert(seq.endsWith("______________"));
        },
        "padUnboundedInfinitely": hi => {
            const seq = hi.repeat("abc").padRight(Infinity, "+");
            hi.assert(seq.startsWith("abcabcabc"));
            hi.assert(seq.endsWith("abcabcabc"));
        },
        "boundsUnknownInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 5);
            hi.assertFail(() => seq().padRight(10, "!"));
        },
    },
});

export default padRight;
