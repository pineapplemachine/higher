import {addSequenceConverter} from "./asSequence";
import {expecting, Expecting, normalizeExpecting} from "./expecting";
import {lightWrap, wrappedTestRunner} from "./lightWrap";
import {attachSequenceMethods} from "./sequence";
import {getWrappedFunction, getWrappedMethod} from "./wrapFunction";
import {getWrappedFunctionAsync} from "./wrapFunction";

import {cleanDocs} from "../docs/cleanString";

const normalizeArguments = (args) => {
    if(args && args.unordered){
        const unordered = args.unordered;
        for(const type of ["numbers", "functions", "sequences"]){
            if(unordered[type] && !unordered[type].amount){
                if(unordered[type].one){
                    unordered[type].amount = 1;
                    unordered[type].order = [unordered[type].one];
                }else if(unordered[type].optional){
                    unordered[type].amount = "?";
                    unordered[type].order = [unordered[type].optional];
                }else if(unordered[type].anyNumberOf){
                    unordered[type].amount = "*";
                    unordered[type].all = unordered[type].anyNumberOf;
                }else if(unordered[type].atLeastOne){
                    unordered[type].amount = "+";
                    unordered[type].all = unordered[type].atLeastOne;
                }else if(unordered[type].order){
                    unordered[type].amount = unordered[type].order.length;
                }else{
                    unordered[type] = {amount: unordered[type]};
                }
            }
            if(unordered[type]){
                const places = [
                    "first", "second", "third", "fourth", "fifth", "sixth"
                ];
                for(let i = 0; i < places.length; i++){
                    if(places[i] in unordered[type]){
                        if(!unordered[type].order) unordered[type].order = [];
                        unordered[type].order[i] = unordered[type][places[i]];
                        unordered[type].order.length = Math.max(
                            i + 1, unordered[type].order.length
                        );
                    }
                }
            }
        }
    }
    return args;
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
