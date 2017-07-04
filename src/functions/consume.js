import {isSequence} from "../core/types";

const consume = (source) => {
    if(isSequence(source)){
        while(!source.done()) source.popFront();
    }else{
        for(const element of source){}
    }
};

export const registration = {
    name: "consume",
    expected: {
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: consume,
};

export default consume;
