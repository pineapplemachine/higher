import {error} from "../core/error";
import {isEqual} from "../core/isEqual";

export const ContractError = error({
    summary: "A sequence failed to compy with a contract.",
    constructor: function ContractError(sequence, contract, options){
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
    contract.contracts.push(info);
};
contract.contracts = [];

export const BidirectionalityContract = contract({
    name: "BidirectionalityContract",
    summary: "The sequence must be consistent forwards and backwards.",
    predicate: (sequence) => (sequence.back),
    tests: [
        (sequence) => {
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
    ],
});

export const CopyingContract = contract({
    name: "CopyingContract",
    summary: "The sequence must produce correct and independent copies.",
    predicate: (sequence) => (sequence.copy),
    tests: [
        (sequence) => {
            const max = 60;
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
    ],
});

export const LengthContract = contract({
    name: "LengthContract",
    summary: "The sequence must report a correct length.",
    predicate: (sequence) => (sequence.length),
    tests: [
        (sequence) => {
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
    ]
});

