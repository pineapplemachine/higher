export const cleanString = function(string){
    const lines = string.split("\n");
    const trimmedLines = [];
    for(const line of lines){
        const trimmed = line.trim();
        if(trimmed.length) trimmedLines.push(trimmed);
    }
    return trimmedLines.join(" ");
};

export default cleanString;
