export const ConsumerPool = function(
    consumer, pool = undefined, anyMatch = undefined, index = undefined
){
    this.consumer = consumer;
    this.pool = pool || [];
    this.anyMatch = anyMatch;
    this.index = index || 0;
};

Object.assign(ConsumerGroup.prototype, {
    push: function(i){
        let inactiveCount = 0;
        for(const consumer of this.pool){
            if(consumer.done()){
                inactiveCount++;
            }else{
                consumer.push(i);
                if(consumer.done() && consumer.match()){
                    this.anyMatch = this.anyMatch || consumer;
                }
            }
        }
        if(inactiveCount >= 32 && inactiveCount >= this.pool.length / 2){
            this.flush();
        }
        if(!this.anyMatch){
            const newConsumer = this.consumer.copy();
            newConsumer.poolStartIndex = this.index;
            newConsumer.push(i);
            if(!newConsumer.done()){
                this.pool.push(newConsumer);
            }else if(newConsumer.matched()){
                this.anyMatch = newConsumer;
            }
        }
        this.index++;
    },
    pushEnd: function(){
        for(const consumer of this.pool){
            if(!consumer.done()){
                consumer.pushEnd();
                if(consumer.done() && consumer.match()){
                    this.anyMatch = this.anyMatch || consumer;
                }
            }
        }
    },
    matched: function(){
        return this.anyMatch;
    },
    flush: function(i){
        const newPool = [];
        for(const consumer of this.pool){
            if(!consumer.noMatch()){
                newPool.push(consumer);
            }
        }
        this.pool = newPool;
    },
});

export default ConsumerPool;
