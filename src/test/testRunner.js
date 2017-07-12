import {hi} from "../higher.js";

console.log(`Running tests for higher@${hi.version}.`);

const results = hi.test();

const functionNames = [];
for(const functionName in results) functionNames.push(functionName);
functionNames.sort();

for(const name of functionNames){
    const passed = results[name].pass.length;
    const failed = results[name].fail.length;
    const total = passed + failed;
    console.log(`${name}: passed ${passed} of ${total}`);
}

let failures = 0;
for(const name of functionNames){
    for(const failure of results[name].fail){
        console.error(`${name}.${failure.name} failed: ${failure.error.stack}`);
        failures++;
    }
}

process.exit(failures !== 0);
