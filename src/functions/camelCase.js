function camelCase(string, wordBoundary){
    if(string.length <= 1) return string;
    const boundaryFunc = wordBoundary || ((ch) => (
        ch === "_" || ch === "-" || ch === " "
    ));
    let result = string[0];
    let capitalize = false;
    for(let i = 1; i < string.length; i++){
        if(boundaryFunc(string[i])){
            capitalize = true;
        }else if(capitalize){
            result += string[i].toUpperCase();
            capitalize = false;
        }else{
            result += string[i];
        }
    }
    return result;
}
