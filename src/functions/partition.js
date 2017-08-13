import {wrap} from "../core/wrap";

export const partition = wrap({
    name: "partition",
    summary: "Partition the elements of a sequence by a predicate into two arrays.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input a predicate function and a known-
            bounded input sequence.
        `),
        returns: (`
            The function returns an array containing two more arrays; the first
            contained array contains those elements of the input that did not
            satisfy the predicate function and the second array contains those
            elements of the input that did satisfy the predicate.
        `),
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {one: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.boundedSequence},
        }
    },
    implementation: (predicate, source) => {
        const a = [];
        const b = [];
        for(const element of source){
            if(predicate(element)) a.push(element);
            else b.push(element);
        }
        return [a, b];
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["hello", "there", "how", "are", "you"];
            const partitions = hi.partition(strings, i => i[0] === "h");
            hi.assertEqual(partitions[0], ["hello", "how"]);
            hi.assertEqual(partitions[1], ["there", "are", "you"]);
        },
        "emptyInput": hi => {
            const partitions = hi.partition(hi.emptySequence(), i => true);
            hi.assertEmpty(partitions[0]);
            hi.assertEmpty(partitions[1]);
        },
        "allSatisfyPredicate": hi => {
            const partitions = hi.partition([2, 4, 6], i => i % 2 === 0);
            hi.assertEqual(partitions[0], [2, 4, 6]);
            hi.assertEmpty(partitions[1]);
        },
        "noneSatisfyPredicate": hi => {
            const partitions = hi.partition([2, 4, 6], i => i % 2 !== 0);
            hi.assertEmpty(partitions[0]);
            hi.assertEqual(partitions[1], [2, 4, 6]);
        },
    },
});

export default partition;
