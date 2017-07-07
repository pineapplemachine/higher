import {wrap} from "../core/wrap";

// Call the encapsulated function only once, with any arguments.
// Successive calls return the value which the first call produced without
// calling the function again.
export const once = wrap({
    name: "once",
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation:  (call) => {
        let called = false;
        let result;
        return (...args) => {
            if(!called){
                result = call(...args);
                called = true;
            }
            return result;
        };
    },
});

export default once;
