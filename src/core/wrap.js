import {addSequenceConverter} from "./asSequence";
import {expecting, Expecting, normalizeExpecting} from "./expecting";
import {lightWrap, wrappedTestRunner} from "./lightWrap";
import {partialLeft, partialRight} from "./partial";
import {attachSequenceMethods} from "./sequence";
import {getWrappedFunction, getWrappedMethod} from "./wrapFunction";
import {getWrappedFunctionAsync} from "./wrapFunction";

import {cleanDocs} from "../docs/cleanString";

const getPartialLeft = (wrapped) => {
    return function(...partialArgs){
        return partialLeft.call(this, wrapped, ...partialArgs);
    };
};

const getPartialRight = (wrapped) => {
    return function(...partialArgs){
        return partialRight.call(this, wrapped, ...partialArgs);
    };
};

export const wrap = lightWrap({
    summary: "Get a wrapped function from a function descriptor.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function wrap(info){
        if(process.env.NODE_ENV === "development"){
            if(!info.implementation) throw new Error(
                "Missing implementation for wrapped function."
            );
            if(!info.arguments) throw new Error(
                "Missing arguments information for wrapped function."
            );
            if(!info.name && !info.names) throw new Error(
                "Missing name or names for wrapped function."
            );
        }
        info.arguments = normalizeExpecting(info.arguments);
        const fancy = getWrappedFunction(info, false);
        fancy.names = info.names || [info.name];
        Object.defineProperty(fancy, "name", {
            value: info.name || info.names[0], writable: false
        });
        fancy.sequences = info.sequences;
        fancy.errors = info.errors;
        fancy.expects = info.expects || info.arguments;
        fancy.implementation = info.implementation;
        fancy.summary = info.summary;
        if(info.async){
            fancy.async = getWrappedFunctionAsync(fancy);
        }
        fancy.partialLeft = getPartialLeft(fancy);
        fancy.partialRight = getPartialRight(fancy);
        fancy.partial = fancy.partialLeft;
        if(fancy.async){
            fancy.async.partialLeft = getPartialLeft(fancy.async);
            fancy.async.partialRight = getPartialRight(fancy.async);
            fancy.async.partial = fancy.async.partialLeft;
        }
        if(info.attachSequence){
            fancy.method = getWrappedMethod(info);
            fancy.method.implementation = info.methodImplementation || info.implementation;
            if(info.async) fancy.method.async = getWrappedFunctionAsync(fancy.method);
            attachSequenceMethods(fancy);
        }
        if(info.asSequence){
            const converterData = {
                name: fancy.name,
                transform: info.implementation
            };
            const converter = Object.assign(converterData, info.asSequence);
            addSequenceConverter(converter);
        }
        if(process.env.NODE_ENV === "development"){
            fancy.docs = cleanDocs(info.docs);
            fancy.tests = info.tests;
            fancy.test = wrappedTestRunner(fancy, info.tests);
        }
        return fancy;
    },
});

wrap.expecting = expecting;
wrap.Expecting = Expecting;

export default wrap;
