import {defineSequence} from "../core/defineSequence";
import {sequenceLengthPatch, sequenceIndexPatch, sequenceSlicePatch} from "../core/sequence";
import {wrap} from "../core/wrap";

export const OnDemandSequence = defineSequence({
    summary: "Eagerly compute the contents of a sequence, but only when first needed.",
    supportComplicated: true,
    supportDescription: process.env.NODE_ENV !== "development" ? undefined : (`
        The output sequence's support depends on the sequence returned by
        the on-demand object's \`dump\` function. The output sequence will
        support all the same operations as that dumped sequence.
    `),
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a sequence constructor and an on-demand
            object as input.
        `),
    },
    constructor: function OnDemandSequence(
        sourceType, onDemandMethods, source = undefined
    ){
        this.sourceType = sourceType;
        this.onDemandMethods = onDemandMethods;
        this.source = source;
        if(!sourceType.nativeBack){
            this.back = undefined;
            this.popBack = undefined;
            this.nextBack = undefined;
        }
        if(!sourceType.nativeLength){
            this.nativeLength = undefined;
            this.length = sequenceLengthPatch;
        }
        if(!sourceType.nativeIndex){
            this.nativeIndex = undefined;
            this.index = sequenceIndexPatch;
        }
        if(!sourceType.nativeSlice){
            this.nativeSlice = undefined;
            this.slice = sequenceSlicePatch;
        }
        if(!sourceType.nativeHas){
            this.has = undefined;
        }
        if(!sourceType.nativeGet){
            this.get = undefined;
        }
    },
    initialize: function(){
        this.source = this.onDemandMethods.dump();
    },
    bounded: function(){
        if(this.source){
            return this.source.bounded();
        }else if(this.onDemandMethods.bounded){
            return this.onDemandMethods.bounded();
        }else{
            this.initialize();
            return this.source.bounded();
        }
    },
    unbounded: function(){
        if(this.source){
            return this.source.unbounded();
        }else if(this.onDemandMethods.unbounded){
            return this.onDemandMethods.unbounded();
        }else{
            this.initialize();
            return this.source.unbounded();
        }
    },
    done: function(){
        if(this.source){
            return this.source.done();
        }else if(this.onDemandMethods.done){
            return this.onDemandMethods.done();
        }else{
            this.initialize();
            return this.source.done();
        }
    },
    length: function(){
        if(this.source){
            return this.source.length();
        }else if(this.onDemandMethods.length){
            return this.onDemandMethods.length();
        }else{
            this.initialize();
            return this.source.length();
        }
    },
    front: function(){
        if(this.source){
            return this.source.front();
        }else if(this.onDemandMethods.front){
            return this.onDemandMethods.front();
        }else{
            this.initialize();
            return this.source.front();
        }
    },
    popFront: function(){
        if(!this.source) this.initialize();
        return this.source.popFront();
    },
    back: function(){
        if(this.source){
            return this.source.back();
        }else if(this.onDemandMethods.back){
            return this.onDemandMethods.back();
        }else{
            this.initialize();
            return this.source.back();
        }
    },
    popBack: function(){
        if(!this.source) this.initialize();
        return this.source.popBack();
    },
    index: function(i){
        if(!this.source) this.initialize();
        return this.source.nativeIndex(i);
    },
    slice: function(i, j){
        if(!this.source) this.initialize();
        return this.source.nativeSlice(i, j);
    },
    has: function(){
        if(this.source){
            return this.source.has(i);
        }else if(this.onDemandMethods.has){
            return this.onDemandMethods.has(i);
        }else{
            this.initialize();
            return this.source.has(i);
        }
    },
    get: function(){
        if(this.source){
            return this.source.get(i);
        }else if(this.onDemandMethods.get){
            return this.onDemandMethods.get(i);
        }else{
            this.initialize();
            return this.source.get(i);
        }
    },
    copy: function(){
        return new OnDemandSequence({
            dump: this.dumpOnDemand,
            done: this.doneOnDemand,
            length: this.lengthOnDemand,
            front: this.frontOnDemand,
            back: this.backOnDemand,
            has: this.hasOnDemand,
            get: this.getOnDemand,
        });
    },
});

export const expectingSequenceType = wrap.Expecting({
    article: "a",
    singular: "sequence constructor",
    plural: "sequence constructors",
    validate: value => {
        if(
            !value || !value.nativeFront ||
            !value.nativePopFront || !value.nativeDone
        ) throw new Error();
        return value;
    },
});

export const expectingOnDemandObject = wrap.Expecting({
    article: "an",
    singular: "on-demand object",
    plural: "on-demand objects",
    short: "object",
    adjective: "an on-demand object",
    suggestion: (
        `An on-demand object is any object with at least a "dump" ` +
        "function attribute."
    ),
    validate: value => {
        if(!value || !value.dump) throw new Error();
        return value;
    },
});

// TODO: More thoroughly document on-demand object spec somewhere
export const onDemandSequence = wrap({
    name: "onDemandSequence",
    summary: "Eagerly compute the contents of a sequence, but only when first needed.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence type and an object as its inputs.
            A sequence type is any sequence constructor.
            The input object must have a \`dump\` function attribute.
            Other specially-regonized but not mandatory attributes are
            \`bounded\`, \`unbounded\`, \`done\`, \`length\`, \`front\`,
            \`back\`, \`has\`, and \`get\`.
            The more such properties that can be provided, the fewer cases that
            will require computing the whole contents of the output sequence to
            obtain the result.
        `),
        returns: (`
            The function returns a sequence whose contents are described by the
            sequence returned by the input object's \`dump\` function attribute.
            The contents of the sequence will be fully computed using that
            function as soon as any information about the output sequence is
            accessed and cannot otherwise be determined.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        ordered: [
            expectingSequenceType,
            expectingOnDemandObject,
        ],
    },
    implementation: (sequenceType, object) => {
        return new OnDemandSequence(sequenceType, object);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Real use cases won't be so simple!
            let hasBeenComputed = false;
            const seq = hi.onDemandSequence(hi.sequence.ArraySequence, {
                // Get whether the sequence is known-bounded or known-unbounded.
                bounded: () => true,
                unbounded: () => false,
                // Get whether the sequence is initially empty.
                done: () => false,
                // Get the length of the sequence.
                length: () => 7,
                // Get the initial front element of the sequence.
                front: () => 1,
                // Get the initial back element of the sequence.
                back: () => 7,
                // Get the whole contents as a sequence.
                dump: () => {
                    hasBeenComputed = true;
                    return new hi.sequence.ArraySequence([1, 2, 3, 4, 5, 6, 7]);
                },
            });
            // The full contents aren't computed until really necessary.
            hi.assert(seq.front() === 1);
            hi.assert(seq.back() === 7);
            hi.assertNot(hasBeenComputed);
            // Actually attempting to consume the sequence will require dumping.
            hi.assertEqual(seq, [1, 2, 3, 4, 5, 6, 7]);
            hi.assert(hasBeenComputed);
        },
    },
});
    
