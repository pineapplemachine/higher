import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const RoundRobinSequence = Sequence.extend({
    constructor: function RoundRobinSequence(
        sources, sourceIndex = undefined, activeSources = undefined
    ){
        this.sources = sources;
        this.source = sources[0];
        this.sourceIndex = sourceIndex || 0;
        this.activeSources = activeSources || [];
        for(const source of sources){
            this.maskAbsentMethods(source);
            // TODO: Maybe this should be moved into initialization logic?
            if(!activeSources && !source.done()){
                this.activeSources.push(source);
            }
        }
    },
    bounded: function(){
        for(const source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    unbounded: function(){
        for(const source of this.sources){
            if(source.unbounded()) return true;
        }
        return true;
    },
    done: function(){
        return this.activeSources.length === 0;
    },
    length: function(){
        let sum = 0;
        for(const source of this.sources) sum += source.length();
        return sum;
    },
    left: function(){
        let sum = 0;
        for(const source of this.activeSources) sum += source.left();
        return sum;
    },
    front: function(){
        return this.activeSources[this.sourceIndex].front();
    },
    popFront: function(){
        this.activeSources[this.sourceIndex].popFront();
        if(this.activeSources[this.sourceIndex].done()){
            this.activeSources.splice(this.sourceIndex, 1);
        }else{
            this.sourceIndex++;
        }
        if(this.sourceIndex >= this.activeSources.length) this.sourceIndex = 0;
    },
    back: null,
    popBack: null,
    // TODO: Implement indexing and possibly slicing (this might be tricky)
    index: null,
    slice: null,
    copy: function(){
        return new RoundRobinSequence(
            this.sources, this.sourceIndex, this.activeSources
        );
    },
    reset: function(){
        this.sourceIndex = 0;
        this.activeSources = [];
        for(const source of this.sources){
            source.reset();
            if(!source.done()) this.activeSources.push(source);
        }
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.sources[0] = source;
        if(!source.done()) this.activeSources[0] = source;
        return this;
    },
});

export const roundRobin = wrap({
    name: "roundRobin",
    attachSequence: true,
    async: false,
    sequences: [
        RoundRobinSequence
    ],
    arguments: {
        unordered: {
            sequences: "*"
        }
    },
    implementation: (sources) => {
        return new RoundRobinSequence(sources);
    },
});

export default roundRobin;
