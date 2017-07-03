import {isSequence} from "../core/types";

export default {
    name: "consume",
    expected: {
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: function(source){
        if(isSequence(source)){
            while(!source.done()) source.popFront();
        }else{
            for(const element of source){}
        }
    },
};
