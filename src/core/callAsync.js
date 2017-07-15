import {constants} from "./constants";
import {lightWrap} from "./lightWrap";

export const callAsync = lightWrap({
    summary: "Call a function asynchronously.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single callback function as input.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: (constants.isNode ?
        function callAsync(callback){
            process.nextTick(callback);
        } :
        function callAsync(callback){
            setTimeout(callback, 0);
        }
    ),
    // TODO: Write an asynchronous tests runner I guess
    testsAsync: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => new hi.constants.Promise((resolve, reject) => {
            hi.callAsync(resolve);
        }),
    },
});

export default callAsync;
