import {lightWrap} from "../core/lightWrap";

import {addConsumerConverter} from "./asConsumer";
import {Consumer} from "./consumer";

export const consumerTypes = {};

// TODO: Thoroughly document consumer type creation somewhere
export const defineConsumer = lightWrap({
    summary: "Extend the @Consumer prototype.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an object whose attributes will be assigned
            to the resulting @Consumer type.
        `),
        returns: (`
            The function returns the constructor for the new @Consumer type.
        `),
    },
    implementation: function defineConsumer(attributes){
        const constructor = attributes.constructor;
        constructor.prototype = Object.create(Consumer.prototype);
        Object.assign(constructor, attributes);
        Object.assign(constructor.prototype, attributes);
        consumerTypes[constructor.name] = constructor;
        if(constructor.converter){
            addConsumerConverter(constructor);
        }
        return constructor;
    },
});

export default defineConsumer;
