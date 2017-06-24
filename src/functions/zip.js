// Simple abstraction of plural map function.
// TODO: Fix this broken messs
hi.zip = function(){
    let transform = function(){return Array.prototype.slice(arguments);};
    return map.raw(transform, arguments);
}
