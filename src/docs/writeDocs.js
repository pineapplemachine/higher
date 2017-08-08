// https://stackoverflow.com/a/12034334/4099022
const htmlEscape = function(text){
    const htmlEntityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(text).replace(/[&<>"'`=\/]/g, char => htmlEntityMap[char]);
};

const linkTo = function(text, target){
    return `<a href="#${target}">${htmlEscape(text)}</a>`;
};

const parseDocString = function(docString){
    let result = "";
    let state = "text";
    let linkText = "";
    let linkTarget = "";
    const linkTargets = [];
    for(const char of docString){
        if(state === "text"){
            if(char === "@"){
                linkText = "";
                linkTarget = "";
                state = "identifierLink";
            }else if(char === "["){
                linkText = "";
                linkTarget = "";
                state = "bracketLink";
            }else{
                result += char;
            }
        }else if(state === "identifierLink"){
            if(char === " "){
                state = "text";
                result += linkTo(linkText, linkText) + " ";
                linkTargets.push(linkText);
            }else{
                linkText += char;
            }
        }else if(state === "identifierLink"){
            if(char === "]"){
                state = "postIdentifierLink";
            }else{
                linkText += char;
            }
        }else if(state === "postIdentifierLink"){
            if(char === "("){
                state = "identifierLinkTarget";
            }else{
                state = "text";
                result += linkTo(linkText, linkText) + " ";
                linkTargets.push(linkText);
            }
        }else if(state === "identifierLinkTarget"){
            if(char === ")"){
                state = "text";
                result += linkTo(linkText, linkTarget) + " ";
                linkTargets.push(linkTarget);
            }else{
                linkTarget += char;
            }
        }else{
            throw new Error();
        }
    }
    return linkTargets;
};

export const writeDocs = function(hi){
    if(process.env.NODE_ENV !== "development") return undefined;
    // Get all documented things
    const links = {};
    const functions = [];
    const sequences = [];
    const errors = [];
    const glossaryTerms = [];
    for(const name in hi.function){
        links[name] = hi.function[name];
        functions.push(name);
    }
    for(const name in hi.sequence){
        links[name] = hi.sequence[name];
        sequences.push(name);
    }
    for(const name in hi.error){
        links[name] = hi.error[name];
        errors.push(name);
    }
    for(const name in hi.glossary){
        links[name] = hi.glossary[name];
        glossaryTerms.push(name);
    }
    functions.sort();
    sequences.sort();
    errors.sort();
    glossaryTerms.sort();
    // Build HTML
    const bodyHtml = "";
    for(const functionName of functions){
        
    }
};

export const functionDocs = function(hi, func){
    const header = `
        <div class="header function-header">${func.name}</div>
    `;
    const aliases = func.names.length === 1 ? "" : `
        <div class="function-aliases">Aliases: <span class="function-alias-names">
            ${func.names.slice(1).join(", ")}
        </span></div>
    `;
    const description = func.docs.detail ? `
        <div class="function-description">func.docs.detail</div>
    ` : `
        <div class="function-description">func.docs.summary</div>
    `;
    return `
        <div class="block function-block">
            
            
        </div>
    `;
};

export default writeDocs;
