import {unboundedError} from "../core/errors";
import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

export const write = wrap({
    name: "write",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 2,
            allowIterables: true
        }
    },
    implementation: (limit, sequences) => {
        const source = sequences[0];
        const target = sequences[1];
        if(!isArray(target)){
            throw "Failed to write sequence: Target must be an array.";
        }
        const iter = source.next ? source : source[Symbol.iterator]();
        let i = 0;
        if(limit === 0){
            // Do nothing
        }else if(!limit){
            if(!source.bounded()){
                throw unboundedError("write", "write");
            }
            let item = iter.next();
            while(!item.done && i < target.length){
                target[i++] = item.value;
                item = iter.next();
            }
            while(!item.done){
                target.push(item.value);
                item = iter.next();
            }
        }else{
            let item = iter.next();
            const firstLimit = target.length < limit ? target.length : limit;
            while(!item.done && i < firstLimit){
                target[i++] = item.value;
                item = iter.next();
            }
            while(!item.done && i < limit){
                target.push(item.value);
                item = iter.next();
                i++;
            }
        }
        return target;
    },
});

export default write;
