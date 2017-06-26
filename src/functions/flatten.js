hi.FlattenSequence = function(source, frontSource = null){
    this.source = source;
    this.frontSource = frontSource;
};

hi.FlattenSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.FlattenSequence.prototype, {
    initializeFront: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            let element = this.source.nextFront();
            if(!hi.validAsSequence(element)){
                this.frontSource = new hi.OnceSequence(element); break;
            }else{
                this.frontSource = hi.asSequence(element);
            }
        }
        this.done = function(){
            return this.frontSource.done();
        };
        this.front = function(){
            return this.frontSource.front();
        };
        this.popFront = function(){
            this.frontSource.popFront();
            while(this.frontSource.done() && !this.source.done()){
                let element = this.source.nextFront();
                if(!hi.validAsSequence(element)){
                    this.frontSource = new hi.OnceSequence(element); break;
                }else{
                    this.frontSource = hi.asSequence(element);
                }
            }
        };
    },
    bounded: () => false,
    done: function(){
        this.initializeFront();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initializeFront();
        return this.frontSource.front();
    },
    popFront: function(){
        this.initializeFront();
        this.popFront();
    },
    // Can't support many operations because a sub-sequence might not support them.
    // TODO: Allow user to insist that the sequence should be bidirectional etc?
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten a single level deep.
hi.register("flatten", {
    sequences: 1,
}, function(source){
    return new hi.FlattenSequence(source);
});
