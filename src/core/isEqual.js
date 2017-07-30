import {asSequence, validAsSequence, validAsImplicitSequence} from "./asSequence";
import {lightWrap} from "./lightWrap";
import {isObject, isString} from "./types";

import {NotBoundedError} from "../errors/NotBoundedError";

export const isEqual = lightWrap({
    summary: "Compare objects, sequences, or other values for deep equality.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Compare the key, value pairs of objects, the elements of
            sequences for deep equality, or other values for equality
            according to the \`===\` operator.
        `),
        expects: (`
            The function accepts any number of arguments of any kind.
            If all the the inputs are implicitly valid as sequences, then
            they are compared as sequences.
            If not compared as sequences, if at least one of the inputs is a
            string literal and all the inputs are valid as sequences, then they
            are compared as strings.
            If not compared as sequences or strings, if all the inputs are
            objects, then they are compared as objects.
            If not compared as sequences, strings, or objects, then the inputs
            are compared as values using the \`===\` comparison operator.
        `),
        returns: (`
            The function returns true when all the inputs were equal and
            false otherwise. It returns true when there was only one input,
            or when there were no inputs.
        `),
        throws: (`
            The function throws a @NotBoundedError if the inputs were compared
            as sequences and none of those sequences were known to be bounded,
            or if the inputs were compared as strings and any of those inputs
            were not known to be bounded.
        `),
        examples: [
            "basicUsageSequences", "basicUsageObjects", "basicUsageValues",
        ],
    },
    implementation: function isEqual(...values){
        if(values.length <= 1) return true;
        let noObject = false;
        let noSequence = false;
        let noString = false;
        let anyString = false;
        for(const value of values){
            if(!isObject(value)) noObject = true;
            if(!validAsImplicitSequence(value)) noSequence = true
            if(!isString(value) && !validAsSequence(value)) noString = true;
            if(isString(value)) anyString = true;
        }
        if(!noSequence){
            return sequencesEqual(...values);
        }else if(anyString && !noString){
            return stringsEqual(...values);
        }else if(!noObject){
            return objectsEqual(...values);
        }else{
            return valuesEqual(...values);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageSequences": hi => {
            hi.assert(hi.isEqual([1, 2, 3], [1, 2, 3]));
            hi.assert(hi.isEqual(hi.range(5), [0, 1, 2, 3, 4]));
        },
        "basicUsageObjects": hi => {
            hi.assert(hi.isEqual(
                {x: 5, y: 10, z: 15}, {x: 5, y: 10, z: 15}
            ));
        },
        "basicUsageValues": hi => {
            hi.assert(hi.isEqual(20, 20));
            hi.assert(hi.isEqual(true, true));
        },
        "emptyIterablesEqual": hi => {
            hi.assert(hi.isEqual([], []));
            hi.assert(hi.isEqual([], ""));
            hi.assert(hi.isEqual("", ""));
            hi.assert(hi.isEqual([], hi.emptySequence()));
            hi.assert(hi.isEqual("", hi.emptySequence()));
            hi.assert(hi.isEqual(hi.emptySequence(), hi.emptySequence()));
        },
    },
});

export const sequencesEqual = lightWrap({
    summary: "Get whether some input sequences are deeply equal.",
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        throws: (`
            The function throws a @NotBoundedError if none of the inputs
            were known to be bounded.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function sequencesEqual(...sources){
        if(sources.length <= 1) return true;
        const sequences = [];
        let anyBounded = false;
        for(const source of sources){
            const sequence = asSequence(source);
            anyBounded = anyBounded || sequence.bounded();
            sequences.push(sequence);
        }
        if(!anyBounded) throw NotBoundedError(sources[0], {
            message: "Failed to compare sequences",
        });
        while(!sequences[0].done()){
            const element = sequences[0].nextFront();
            for(let i = 1; i < sequences.length; i++){
                if(sequences[i].done()) return false;
                if(!isEqual(element, sequences[i].nextFront())) return false;
            }
        }
        for(const sequence of sequences){
            if(!sequence.done()) return false;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(sequencesEqual(hi.range(4), [0, 1, 2, 3]));
        },
        "arrayInputs": hi => {
            hi.assert(sequencesEqual([], []));
            hi.assert(sequencesEqual([], [], []));
            hi.assert(sequencesEqual([], [], [], []));
            hi.assert(sequencesEqual([1], [1]));
            hi.assert(sequencesEqual([1], [1], [1]));
            hi.assertNot(sequencesEqual([1], [2]));
            hi.assertNot(sequencesEqual([1, 2], [1]));
            hi.assertNot(sequencesEqual([1], [1, 2]));
            hi.assertNot(sequencesEqual([1], [1], [1], [2]));
            hi.assert(sequencesEqual([0, 1, 2], [0, 1, 2]));
            hi.assert(sequencesEqual(["x", "y"], ["x", "y"]));
            hi.assert(sequencesEqual([4, 3], [4, 3], [4, 3], [4, 3]));
        },
    },
});

export const stringsEqual = lightWrap({
    summary: "Get whether some strings and input sequences are equal.",
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        throws: (`
            The function throws a @NotBoundedError if any of the inputs
            were not known to be bounded.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function stringsEqual(...sources){
        // TODO: It should be possible to do these comparisons lazily and
        // with potentially unbounded sequences, just kind of tedious to
        // implement.
        if(sources.length <= 1) return true;
        const strings = [];
        for(const source of sources){
            if(isString(source)){
                strings.push(source);
            }else{
                NotBoundedError.enforce(source, {
                    message: "Failed to compare strings",
                });
                let sequenceString = "";
                for(const element of source) sequenceString += element;
                strings.push(sequenceString);
            }
        }
        for(let i = 1; i < strings.length; i++){
            if(strings[i] !== strings[0]) return false;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(stringsEqual("hello", "hello"));
            hi.assertNot(stringsEqual("hello", "world"));
        },
        "sequenceInputs": hi => {
            hi.assert(stringsEqual("hello", hi("hello")));
            hi.assert(stringsEqual(hi("hello"), hi("hello")));
            hi.assert(stringsEqual("hello", "hello", hi("hello")));
            hi.assert(stringsEqual("hello", hi("hello"), hi("hello")));
            hi.assert(stringsEqual(hi("hello"), hi("hello"), hi("hello")));
        },
        "noInputs": hi => {
            hi.assert(stringsEqual());
        },
        "oneInput": hi => {
            hi.assert(stringsEqual("?"));
            hi.assert(stringsEqual(hi("!")));
        },
    },
});

export const objectsEqual = lightWrap({
    summary: "Get whether some input objects are deeply equal.",
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function objectsEqual(...objects){
        if(objects.length > 1){
            const visited = {};
            for(let i = 0; i < objects.length; i++){
                for(const key in objects[i]){
                    if(!visited[key]){
                        visited.key = true;
                        const compare = [];
                        for(let j = 0; j < objects.length; j++){
                            compare.push(objects[j][key]);
                        }
                        if(!isEqual(...compare)) return false;
                    }
                }
            }
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(objectsEqual(
                {x: 5, y: 10, z: 15}, {x: 5, y: 10, z: 15}
            ));
            hi.assertNot(objectsEqual(
                {x: 1, y: 2, z: 3}, {x: 8, y: 8, z: 8}
            ));
        },
        "noInputs": hi => {
            hi.assert(objectsEqual());
        },
        "oneInput": hi => {
            hi.assert(objectsEqual({}));
            hi.assert(objectsEqual({x: 0, y: 1}));
        },
    },
});

export const valuesEqual = lightWrap({
    summary: "Get whether some values are equal.",
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function valuesEqual(...values){
        for(let i = 1; i < values.length; i++){
            if(values[i] !== values[0]) return false;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(valuesEqual(5, 5));
            hi.assert(valuesEqual(7, 7, 7));
        },
        "noInputs": hi => {
            hi.assert(valuesEqual());
        },
        "singleInput": hi => {
            hi.assert(valuesEqual(0));
            hi.assert(valuesEqual(1));
            hi.assert(valuesEqual(true));
            hi.assert(valuesEqual(Infinity));
            hi.assert(valuesEqual(NaN));
            hi.assert(valuesEqual("!!"));
        },
        "numericInputs": hi => {
            hi.assert(valuesEqual(0, 0));
            hi.assert(valuesEqual(1, 1));
            hi.assert(valuesEqual(10, 10));
            hi.assert(valuesEqual(150, 150));
            hi.assert(valuesEqual(-90.5, -90.5));
        },
    },
});

export default isEqual;
