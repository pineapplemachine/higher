export const cleanString = function(string){
    const lines = string.split("\n");
    let result = "";
    for(const line of lines){
        const trimmed = line.trim();
        if(trimmed[0] === "/"){
            if(result.length) result += "\n";
            result += trimmed.slice(1);
        }else if(trimmed.length){
            if(result.length) result += " ";
            result += trimmed;
        }
    }
    return result;
};

export default cleanString;
