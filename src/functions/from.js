import Sequence from "../core/sequence";

// Enumerate those elements of an input sequence starting from the first
// element matching a predicate.
const FromSequence = function(
    predicate, source, isInclusive = true, initialized = false
){
    this.predicate = predicate;
    this.source = source;
    this.isInclusive = isInclusive;
    this.initialized = initialized;
    this.maskAbsentMethods(source);
};

FromSequence.prototype = Object.create(Sequence.prototype);
FromSequence.prototype.constructor = FromSequence;
Object.assign(FromSequence.prototype, {
    initialize: function(){
        this.initialized = true;
        while(!this.source.done()){
            if(this.predicate(this.source.front())){
                if(!this.isInclusive) this.source.popFront();
                break;
            }else{
                this.source.popFront();
            }
        }
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            return this.source.popFront();
        };
    },
    inclusive: function(){
        this.isInclusive = true;
        return this;
    },
    exclusive: function(){
        this.isInclusive = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.source.front();
    },
    popFront: function(){
        this.initialize();
        return this.source.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new FromSequence(
            this.predicate, this.source.copy(),
            this.isInclusive, this.initialized
        );
        if(this.initialized){
            copy.done = this.done;
            copy.front = this.front;
            copy.popFront = this.popFront;
        }
        return this;
    },
    reset: function(){
        this.source.reset();
        delete this.done;
        delete this.front;
        delete this.popFront;
        return this;
    },
});

const fromFn = (predicate, source) => {
    return new FromSequence(predicate, source);
};

export const registration = {
    name: "from",
    expected: {
        functions: 1,
        sequences: 1,
    },
    implementation: fromFn,
};

export default fromFn;
