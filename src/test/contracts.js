import {error} from "../core/error";
import {isEqual} from "../core/isEqual";
import {lightWrap} from "../core/lightWrap";

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
            this.message += " " + this.options.message;
        }
        if(this.options.error){
            this.message += (
                " Caused by unhandled error: " + this.options.error.message
            );
        }
    },
});

export const contractTypes = {};

// TODO: Make a Contract class
export const defineContract = lightWrap({
    summary: "Define a sequence contract.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineContract(info){
        info.enforce = function(getSequence){
            const sequence = getSequence();
            if(this.predicate(sequence)){
                if(!this.test(getSequence)) throw ContractError(sequence, this);
            }
        };
        info.name = info.test.name;
        contractTypes[info.name] = info;
    },
});

// Convenience alias
export const contract = defineContract;

// TODO: Contract to test copying after partial consumption
// TODO: Contract to test consuming the same sequence from both ends to the middle
// TODO: Contract to test left attribute
// TODO: Contract to test indexing
// TODO: Contract to test length and contents of slices
// TODO: Contract to test correct bidirectionality of slices
// TODO: Contract to test indexing of slices
// TODO: Contract to test resetting
// TODO: Contract to test rebasing

export const BidirectionalityContract = defineContract({
    summary: "The sequence must be consistent forwards and backwards.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    predicate: (sequence) => (sequence.back),
    test: function BidirectionalityContract(sequence){
        const max = 100;
        const forward = [];
        const backward = [];
        const a = sequence();
        const b = sequence();
        if(!a.bounded()) return true;
        while(!a.done()){
            forward.push(a.nextFront());
            if(forward.length > max) throw ContractError(a, this, {
                message: "Input sequence is too long to test.",
            });
        }
        while(!b.done()){
            backward.push(b.nextBack());
            if(backward.length > max) throw ContractError(b, this, {
                message: "Input sequence is too long to test.",
            });
        }
        if(forward.length !== backward.length) return false;
        for(let i = 0; i < forward.length; i++){
            if(!isEqual(a[i], b[forward.length - i - 1])){
                throw ContractError(sequence(), {
                    message: `Elements at forward index ${i} were unequal.`,
                });
            }
        }
        return true;
    },
});

export const CopyingContract = defineContract({
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
        const aArray = [];
        while(!a.done() && aArray.length < max) aArray.push(a.nextFront());
        const bArray = [];
        while(!b.done() && bArray.length < max) bArray.push(b.nextFront());
        const dArray = [];
        while(!d.done() && dArray.length < max) dArray.push(d.nextFront());
        const cArray = [];
        while(!c.done() && cArray.length < max) cArray.push(c.nextFront());
        return isEqual(aArray, bArray, cArray, dArray);
    },
});

export const LengthContract = defineContract({
    summary: "The sequence must report a correct length.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    predicate: (sequence) => (sequence.nativeLength),
    test: function LengthContract(sequence){
        const a = sequence();
        if(!a.bounded()) throw ContractError(sequence(), this, {
            message: "Unbounded sequences must not implement a length method."
        });
        if(a.done()){
            if(a.nativeLength() !== 0) throw ContractError(sequence(), this, {
                message: "An empty sequence must have a length of zero."
            });
            return true;
        }
        const length = a.nativeLength();
        if(!Number.isInteger(length)) throw ContractError(sequence(), this, {
            message: "Sequence length must be an integer."
        });
        let aCount = 0;
        while(!a.done()){
            a.popFront();
            aCount++;
            if(aCount > length) return false;
        }
        if(length !== aCount) return false;
        if(a.nativeLength() !== aCount) return false;
        const b = sequence();
        let bCount = 0;
        while(!b.done()){
            let x = b.front();
            b.popFront();
            bCount++;
            if(bCount > length) return false;
        }
        if(bCount !== aCount) return false;
        if(b.nativeLength() !== bCount) return false;
        return true;
    },
});

export default defineContract;
