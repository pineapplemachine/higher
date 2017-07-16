import {hi} from "../higher.js";

const red = text => '\u001b[31m' + text + '\u001b[39m';
const green = text => '\u001b[32m' + text + '\u001b[39m';

const version = green(`higher@${hi.version}`);
console.log(`Running tests for ${version}.`);

const ofText = (passed, failed) => {
    const text = `${passed} of ${passed + failed}`;
    return failed === 0 ? green(text) : red(text);
};

const results = hi.test();

const functionNames = [];
for(const functionName in results.functions) functionNames.push(functionName);
functionNames.sort();

const sequenceNames = [];
for(const sequenceName in results.sequences) sequenceNames.push(sequenceName);
sequenceNames.sort();

let totalPassed = 0;
let totalFailed = 0;

for(const name of functionNames){
    const passed = results.functions[name].pass.length;
    const failed = results.functions[name].fail.length;
    totalPassed += passed;
    totalFailed += failed;
    console.log(
        `Function ${name}: passed ${ofText(passed, failed)} tests.`
    );
}

for(const name of sequenceNames){
    const passed = results.sequences[name].pass.length;
    const failed = results.sequences[name].fail.length;
    totalPassed += passed;
    totalFailed += failed;
    console.log(
        `Sequence ${name}: passed ${ofText(passed, failed)} tests.`
    );
}

for(const name of functionNames){
    for(const failure of results.functions[name].fail){
        console.error(red(
            `Function ${name}.${failure.name} test failed: ${failure.error.stack}`
        ));
    }
}

for(const name of sequenceNames){
    for(const failure of results.sequences[name].fail){
        console.error(red(
            `Sequence ${name}.${failure.name} test failed: ${failure.error.stack}`
        ));
    }
}

console.log(`Finished running tests: passed ${ofText(totalPassed, totalFailed)} tests.`);

// Once a release is ready, these should become warnings rather than encouragements.
for(const func of hi.functions){
    if(!(func.name in results.functions)){
        console.log(`Next function without any tests: ${green(func.name)}.`);
        break;
    }
}
for(const sequenceName in hi.sequences){
    if(!(sequenceName in results.sequences)){
        console.log(`Next sequence without any tests: ${green(sequenceName)}.`);
        break;
    }
}

process.exit(totalFailed !== 0);
