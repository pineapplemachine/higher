import {wrap} from "../core/wrap";

import {BoundsUnknownError} from "../errors/BoundsUnknownError";

import {EagerSequence} from "./eager";
import {FinitePadRightSequence, InfinitePadRightSequence} from "./padRightCount";

export const padRight = wrap({
    name: "padRight",
    summary: "Satisfy a length requirement by padding the back of a sequence with some repeated element.",
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
            "padLeft", "padRightCount",
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
                message: "Failed to right pad sequence.",
            });
            const padSource = source.length ? source : new EagerSequence(source);
            const sourceLength = padSource.length();
            if(targetLength <= sourceLength){
                return padSource;
            }else{
                return new FinitePadRightSequence(
                    padSource, element, targetLength - sourceLength
                );
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
            // Ok to pad with 0 elements
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 5);
            hi.assertEqual(seq().padRight(0, "!"), [0, 1, 2, 3, 4]);
            // Ok to pad with infinity elements
            const inf = seq().padRight(Infinity, "!");
            hi.assert(inf.startsWith([0, 1, 2, 3, 4, "!", "!", "!"]));
            hi.assert(inf.endsWith(["!", "!", "!"]));
            // Error to pad with any other number of elements
            hi.assertFailWith(BoundsUnknownError,
                () => seq().padRight(10, "!")
            );
        },
    },
});

export default padRight;
