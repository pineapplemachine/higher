export const coreTests = {
    "asSequence": {
        "basicUsageArray": hi => {
            const seq = hi.asSequence([1, 2, 3]);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 2);
            hi.assert(seq.nextFront() === 3);
            hi.assert(seq.done());
        },
        "basicUsageString": hi => {
            const seq = hi.asSequence("hi!");
            hi.assert(seq.nextFront() === "h");
            hi.assert(seq.nextFront() === "i");
            hi.assert(seq.nextFront() === "!");
            hi.assert(seq.done());
        },
        "basicUsageObject": hi => {
            const obj = {hello: "world"};
            const seq = hi.asSequence(obj);
            hi.assertEqual(seq.nextFront(), {
                key: "hello", value: "world"
            });
            hi.assert(seq.done());
        },
        "basicUsageIterable": hi => {
            const countdown = function*(n){
                while(n > 0) yield n--;
                yield 0;
            };
            const seq = hi.asSequence(countdown(3));
            hi.assert(seq.nextFront() === 3);
            hi.assert(seq.nextFront() === 2);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 0);
            hi.assert(seq.done());
        },
    },
};

export const coreTestRunner = (hi, tests) => {
    const result = {
        pass: [],
        fail: [],
    };
    for(const testName in tests){
        const test = tests[testName];
        let success = true;
        try{
            test(hi);
        }catch(error){
            success = false;
            result.fail.push({name: testName, error: error});
        }
        if(success){
            result.pass.push({name: testName});
        }
    }
    return result;
};

export default coreTests;
