import {constants} from "./constants";

export const callAsync = (constants.isNode ?
    (callback) => process.nextTick(callback) :
    (callback) => setTimeout(callback, 0)
);

export default callAsync;
