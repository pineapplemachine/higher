import {wrap} from "../core/wrap";

import {EagerSequence} from "./eager";
import {FinitePadLeftSequence, InfinitePadLeftSequence} from "./padLeftCount";

export const PadLeftOnDemandSequence = function(source, targetLength, element){
    return new OnDemandSequence(FinitePadLeftSequence.appliedTo(ArraySequence), {
        bounded: () => source.bounded(),
        unbounded: () => false, // Do not call this function with unbounded inputs
        done: () => source.done() && targetLength === 0,
        back: () => source.done() ? element : source.back(),
        dump: () => {
            const array = [];
            for(const element of source) array.push(element);
            if(array.length >= targetLength){
                return arraySequence;
            }else{
                return new FinitePadLeftSequence(
                    arraySequence, element, array.length - targetLength
                );
            }
        },
    });
};

export const padLeft = wrap({
    name: "padLeft",
    summary: "Satisfy a length requirement by padding the front of a sequence with some repeated element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
        related: [
            "padRight", "padLeftCount",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.knownBoundsSequence,
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
                    return new FinitePadLeftSequence(
                        source, element, targetLength - sourceLength
                    );
                }
            }else{ // Argument validation implies source.bounded()
                return PadLeftOnDemandSequence(source, targetLength, element);
            }
        }else{
            return new InfinitePadLeftSequence(source, element);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi("123").padLeft(5, "0"), "00123");
        },
        "numericInput": hi => {
            hi.assertEqual(hi([1, 2, 3]).padLeft(6, 0), [0, 0, 0, 1, 2, 3]);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().padLeft(3, "!"), "!!!");
        },
        "longerInputThanTargetLength": hi => {
            hi.assertEqual(hi("beep").padLeft(4, "_"), "beep");
            hi.assertEqual(hi("hello").padLeft(3, "_"), "hello");
            hi.assertEqual(hi("!").padLeft(1, "_"), "!");
            hi.assertEqual(hi("abc").padLeft(0, "_"), "abc");
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("abc").padLeft(2, "!");
            hi.assert(seq.startsWith("abcabcabc"));
            hi.assert(seq.endsWith("abcabcabc"));
        },
        "padBoundedInfinitely": hi => {
            const seq = hi("hello").padLeft(Infinity, "_");
            hi.assert(seq.startsWith("______________"));
            hi.assert(seq.endsWith("_________hello"));
        },
        "padUnboundedInfinitely": hi => {
            const seq = hi.repeat("abc").padLeft(Infinity, "+");
            hi.assert(seq.startsWith("abcabcabc"));
            hi.assert(seq.endsWith("abcabcabc"));
        },
        "boundsUnknownInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 5);
            hi.assertFail(() => seq().padLeft(10, "!"));
        },
    },
});

export default padLeft;
