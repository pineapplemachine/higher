import {error} from "../core/error";
import {isEqual} from "../core/isEqual";

export const ContractError = error({
    summary: "A sequence failed to compy with a contract.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as arguments an instance of the
            sequence which failed to satisfy the contract and the contract that
            was not satisfied.
            The function also accepts an options object which may have a message
            attribute providing additional error information.
        `),
    },
    constructor: function ContractError(
        sequence, contract, options = undefined
    ){
        this.sequence = sequence;
        this.contract = contract;
        this.options = options || {};
        this.error = this.options.error;
        this.message = (
            `The ${sequence.typeChainString()} sequence did not comply with ` +
            `the ${contract.name} contract.`
        );
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
        if(this.options.error){
            this.message += (
                " Caused by unhandled error: " + this.options.error.message
            );
        }
    },
});

// TODO: Make a Contract class
export const contract = (info) => {
    info.enforce = function(getSequence){
        const sequence = getSequence();
        if(this.predicate(sequence)){
            try{
                for(const test of this.tests){
                    if(!test(getSequence)) throw ContractError(sequence, this);
                }
            }catch(error){
                throw (error.type === "ContractError" ? error :
                    ContractError(sequence, this, {error: error})
                );
            }
        }
    };
    info.name = info.test.name;
    contract.contracts.push(info);
};
contract.contracts = [];

export const BidirectionalityContract = contract({
    summary: "The sequence must be consistent forwards and backwards.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    predicate: (sequence) => (sequence.back),
    test: function BidirectionalityContract(sequence){
        const forward = [];
        const backward = [];
        const a = sequence();
        const b = sequence();
        if(!a.bounded()) return true;
        while(!a.done()) forward.push(a.nextFront());
        while(!b.done()) backward.push(b.nextBack());
        if(a.length !== b.length) return false;
        for(let i = 0; i < forward.length; i++){
            if(!isEqual(a[i], b[forward.length - i - 1])){
                throw ContractError(sequence(), {
                    message: `Elements at forward index ${i} were unequal.`
                });
            }
        }
        return true;
    },
});

export const CopyingContract = contract({
    summary: "The sequence must produce correct and independent copies.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            The contract verifies that copying a sequence produces correct
            copies that are not affected by changing the state of the sequence
            it was copied from, or a sequence that was produced by copying it.
            Empty sequences always satisfy the contract.
            The contract is tested even for sequences not known to be bounded;
            in no case are no more than the first forty elements of the input
            sequence consumed.
        `),
    },
    predicate: (sequence) => (sequence.copy),
    test: function CopyingContract(sequence){
        const max = 40;
        const a = sequence();
        if(a.done()) return true;
        const b = a.copy();
        const c = a.copy();
        const d = c.copy();
        if(!isEqual(a.front(), b.front(), c.front(), d.front())) return false;
        const aArray = [];
        while(!a.done() && aArray.length < max) aArray.push(a.nextFront());
        if(!isEqual(aArray[0], b.front(), c.front(), d.front())) return false;
        const bArray = [];
        while(!b.done() && bArray.length < max) bArray.push(b.nextFront());
        if(!isEqual(aArray, bArray)) return false;
        if(!isEqual(aArray[0], c.front(), d.front())) return false;
        const dArray = [];
        while(!d.done() && dArray.length < max) dArray.push(d.nextFront());
        if(!isEqual(aArray, dArray)) return false;
        if(!isEqual(aArray[0], c.front())) return false;
        const cArray = [];
        while(!c.done() && cArray.length < max) cArray.push(c.nextFront());
        if(!isEqual(aArray, cArray)) return false;
        return true;
    },
});

export const LengthContract = contract({
    summary: "The sequence must report a correct length.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    predicate: (sequence) => (sequence.length),
    test: function CopyingContract(sequence){
        const a = sequence();
        if(!a.bounded()) throw ContractError(sequence(), {
            message: "Unbounded sequences must not implement a length method."
        });
        if(a.done()){
            if(a.length() !== 0) throw ContractError(sequence(), {
                message: "An empty sequence must have a length of zero."
            });
            return true;
        }
        let aCount = 0;
        const length = a.length();
        while(!a.done()){
            a.popFront();
            aCount++;
        }
        if(length !== aCount) return false;
        if(a.length() !== aCount) return false;
        const b = sequence();
        let bCount = 0;
        while(!b.done()){
            let x = b.front();
            b.popFront();
            bCount++;
        }
        if(bCount !== aCount) return false;
        if(b.length() !== bCount) return false;
        return true;
    },
});

