import {wrap} from "../core/wrap";

export const groupBy = wrap({
    name: "groupBy",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (transform, source) => {
        const object = {};
        for(const element of source){
            const key = transform(element);
            if(object[key]) object[key].push(element);
            else object[key] = [element];
        }
        return object;
    },
});

export default groupBy;
