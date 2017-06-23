// Simple abstraction of plural map function.
const zip = function(){
    let transform = function(){return Array.prototype.slice(arguments);};
    return map.raw(transform, arguments);
}
