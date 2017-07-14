import {isSequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const consume = wrap({
    name: "consume",
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        if(isSequence(source)){
            while(!source.done()) source.popFront();
        }else{
            for(const element of source){}
        }
        return source;
    },
});

export default consume;
