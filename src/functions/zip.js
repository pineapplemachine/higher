import {asSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

import {map} from "./map";

export const zipTransform = (...args) => (args);

// Simple abstraction of plural map function.
export const zip = wrap({
    name: "zip",
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            sequences: "*"
        }
    },
    implementation: (sources) => {
        return map.implementation(zipTransform, sources);
    },
});

export default zip;
