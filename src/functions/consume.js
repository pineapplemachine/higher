import {isSequence} from "../core/types";
import {expecting, wrap} from "../core/wrap";

export const consume = wrap({
    name: "consume",
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
    },
    implementation: (source) => {
        if(isSequence(source)){
            while(!source.done()) source.popFront();
        }else{
            for(const element of source){}
        }
    },
});

export default consume;
