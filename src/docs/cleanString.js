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

export const cleanDocs = function(docs, noMethods = undefined){
    if(!docs) return undefined;
    docs.detail = cleanString(docs.detail || "");
    docs.expects = cleanString(docs.expects || "");
    docs.returns = cleanString(docs.returns || "");
    docs.throws = cleanString(docs.throws || "");
    docs.warnings = cleanString(docs.warnings || "");
    docs.developers = cleanString(docs.developers || "");
    if(docs.methods && !noMethods){
        for(const methodName in docs.method){
            docs.methods[methodName] = cleanDocs(
                docs.methods[methodName], true
            );
        }
    }
    return docs;
};

export default cleanString;
