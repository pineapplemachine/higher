import {wrap} from "../core/wrap";

import {BoundsUnknownError} from "../errors/BoundsUnknownError";

import {EagerSequence} from "./eager";
import {FinitePadLeftSequence, InfinitePadLeftSequence} from "./padLeftCount";

export const padLeft = wrap({
    name: "padLeft",
    summary: "Satisfy a length requirement by padding the front of a sequence with some repeated element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        throws: (`
            The function throws a @BoundsUnknownError if the input sequence did
            not have known length and was not known to be either bounded or
            unbounded, and the target length was not @Infinity.
        `),
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
            wrap.expecting.sequence, wrap.expecting.number, wrap.expecting.anything
        ],
    },
    implementation: (source, targetLength, element) => {
        if(targetLength <= 0 || source.unbounded()){
            return source;
        }else if(isFinite(targetLength)){
            if(!source.bounded()) throw BoundsUnknownError(source, {
                message: "Failed to left pad sequence.",
            });
            const padSource = source.length ? source : new EagerSequence(source);
            const sourceLength = padSource.length();
            if(targetLength <= sourceLength){
                return padSource;
            }else{
                return new FinitePadLeftSequence(
                    padSource, element, targetLength - sourceLength
                );
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
            // Ok to pad with 0 elements
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 5);
            hi.assertEqual(seq().padLeft(0, "!"), [0, 1, 2, 3, 4]);
            // Ok to pad with infinity elements
            const inf = seq().padLeft(Infinity, "!");
            hi.assert(inf.startsWith(["!", "!", "!"]));
            // Error to pad with any other number of elements
            hi.assertFailWith(BoundsUnknownError,
                () => seq().padLeft(10, "!")
            );
        },
    },
});

export default padLeft;
