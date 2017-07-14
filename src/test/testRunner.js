import {hi} from "../higher.js";

console.log(`Running tests for higher@${hi.version}.`);

const results = hi.test();

const functionNames = [];
for(const functionName in results.functions) functionNames.push(functionName);
functionNames.sort();

const sequenceNames = [];
for(const sequenceName in results.sequences) sequenceNames.push(sequenceName);
sequenceNames.sort();

for(const name of functionNames){
    const passed = results.functions[name].pass.length;
    const failed = results.functions[name].fail.length;
    const total = passed + failed;
    console.log(`Function ${name}: passed ${passed} of ${total}`);
}

for(const name of sequenceNames){
    const passed = results.sequences[name].pass.length;
    const failed = results.sequences[name].fail.length;
    const total = passed + failed;
    console.log(`Sequence ${name}: passed ${passed} of ${total}`);
}

let failures = 0;

for(const name of functionNames){
    for(const failure of results.functions[name].fail){
        console.error(`Function ${name}.${failure.name} failed: ${failure.error.stack}`);
        failures++;
    }
}

for(const name of sequenceNames){
    for(const failure of results.sequences[name].fail){
        console.error(`Sequence ${name}.${failure.name} failed: ${failure.error.stack}`);
        failures++;
    }
}

process.exit(failures !== 0);
