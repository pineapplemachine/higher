import {addSequenceConverter} from "./asSequence";
import {expecting, Expecting, normalizeExpecting} from "./expecting";
import {lightWrap, wrappedTestRunner} from "./lightWrap";
import {attachSequenceMethods} from "./sequence";
import {getWrappedFunction, getWrappedMethod} from "./wrapFunction";
import {getWrappedFunctionAsync} from "./wrapFunction";

import {cleanDocs} from "../docs/cleanString";

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
        if(info.attachSequence){
            fancy.method = getWrappedMethod(info);
            fancy.method.implementation = info.methodImplementation || info.implementation;
            if(info.async) fancy.method.async = getWrappedFunctionAsync(fancy.method);
            attachSequenceMethods(fancy);
        }
        if(info.asSequence){
            const converter = Object.assign(
                {transform: info.implementation}, info.asSequence
            );
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
