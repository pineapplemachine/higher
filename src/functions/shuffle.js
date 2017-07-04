import Sequence from "../core/sequence";
import {ArraySequence} from "../core/asSequence";

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_.22inside-out.22_algorithm

const ShuffleSequence = function(
    random, source, shuffledSource = undefined,
    lowIndex = undefined, highIndex = undefined,
    frontIndex = undefined, backIndex = undefined
){
    if(!source.bounded()){
        throw "Error shuffling sequence: Input must be known to be bounded.";
    }
    this.random = random;
    this.source = source;
    // Note that shuffledSource will be an array, not a sequence.
    this.shuffledSource = shuffledSource;
    this.lowIndex = lowIndex;
    this.highIndex = highIndex;
    this.frontIndex = frontIndex;
    this.backIndex = backIndex;
    if(!source.length) this.length = null;
    if(!source.has) this.has = null;
    if(!source.get) this.get = null;
    if(!source.copy) this.copy = null;
};

ShuffleSequence.prototype = Object.create(Sequence.prototype);
ShuffleSequence.prototype.constructor = ShuffleSequence;
Object.assign(ShuffleSequence.prototype, {
    initialize: function(){
        this.shuffledSource = [];
        let i = 0;
        for(const element of this.source){
            const j = Math.floor(this.random() * i);
            if(j === i){
                this.shuffledSource.push(element);
            }else{
                this.shuffledSource.push(this.shuffledSource[j]);
                this.shuffledSource[j] = element;
            }
            i++;
        }
        this.lowIndex = 0;
        this.highIndex = this.shuffledSource.length;
        this.frontIndex = 0;
        this.backIndex = this.highIndex;
        this.done = function(){
            return this.frontIndex >= this.backIndex;
        };
        this.left = function(){
            return this.backIndex - this.frontIndex;
        };
        this.front = function(){
            return this.shuffledSource[this.frontIndex];
        };
        this.popFront = function(){
            this.frontIndex++;
        };
        this.back = function(){
            return this.shuffledSource[this.backIndex - 1];
        };
        this.popBack = function(){
            this.backIndex--;
        };
        this.index = function(i){
            return this.shuffledSource[i];
        };
        this.slice = function(i, j){
            return new ArraySequence(this.shuffledSource, i, j);
        };
        this.copy = function(){
            return new ShuffleSequence(
                this.random, this.source, this.shuffledSource,
                this.lowIndex, this.highIndex, this.frontIndex, this.backIndex
            );
        };
        this.reset = function(){
            this.frontIndex = this.lowIndex;
            this.backIndex = this.highIndex;
            return this;
        };
    },
    bounded: () => true,
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        this.initialize();
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        if(!this.shuffledSource) this.initialize();
        return this.shuffledSource[this.frontIndex];
    },
    popFront: function(){
        if(!this.shuffledSource) this.initialize();
        this.frontIndex++;
    },
    back: function(){
        if(!this.shuffledSource) this.initialize();
        return this.shuffledSource[this.backIndex - 1];
    },
    popBack: function(){
        if(!this.shuffledSource) this.initialize();
        this.backIndex--;
    },
    index: function(i){
        if(!this.shuffledSource) this.initialize();
        return this.shuffledSource[i];
    },
    slice: function(i, j){
        if(!this.shuffledSource) this.initialize();
        return new ArraySequence(this.shuffledSource, i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new ShuffleSequence(this.random, this.source.copy());
    },
    reset: function(){
        return this;
    },
    collapseBreak: function(target, length){
        for(let i = 0; i < length; i++){
            const j = Math.floor(this.random() * i);
            if(j !== i){
                const t = target[i];
                target[i] = target[j];
                target[j] = t;
            }
        }
        return length;
    },
});

/**
 * Shuffle the elements of an input, generating a new sequence containing
 * the same elements but in a randomly-determined order.
 * The random function must return a new random number that is at least 0 and
 * less than 1 on each call.
 * The produced sequence has the same interface as any other, but note that
 * the first time many of its properties are accessed (e.g. front, back)
 * the source sequence must be immediately entirely consumed.
 * @param {*} random
 * @param {*} source
 */
const shuffle = (random, source) => {
    return new ShuffleSequence(random || Math.random, source);
};

export const registration = {
    name: "shuffle",
    expected: {
        functions: "?",
        sequences: 1,
    },
    implementation: shuffle,
};

export {ShuffleSequence};

export default shuffle;
