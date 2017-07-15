import {asSequence, validAsImplicitSequence} from "./asSequence";
import {isObject} from "./types";

// Compare sequences for deep equality.
export const sequencesEqual = (...sources) => {
    if(sources.length > 1){
        const sequences = [];
        for(const source of sources){
            sequences.push(asSequence(source));
        }
        while(!sequences[0].done()){
            const element = sequences[0].nextFront();
            for(let i = 1; i < sequences.length; i++){
                if(sequences[i].done()) return false;
                if(!isEqual(element, sequences[i].nextFront())) return false;
            }
        }
    }
    return true;
};

// Compare arbitrary objects for deep equality.
export const objectsEqual = (...objects) => {
    if(objects.length > 1){
        const visited = {};
        for(let i = 0; i < objects.length; i++){
            for(const key in objects[i]){
                if(!visited[key]){
                    visited.key = true;
                    const compare = [];
                    for(let j = 0; j < objects.length; j++){
                        compare.push(objects[j][key]);
                    }
                    if(!isEqual(...compare)) return false;
                }
            }
        }
    }
    return true;
};

// Compare values for equality.
export const valuesEqual = (...values) => {
    for(let i = 1; i < values.length; i++){
        if(values[i] !== values[0]) return false;
    }
    return true;
};

// Compare values for equality.
// If they are all implicitly valid as sequences, treat them as sequences.
// If they are all objects, treat them as objects.
export const isEqual = (...values) => {
    if(values.length <= 1) return true;
    let noObject = false;
    let noSequence = false;
    for(const value of values){
        if(!value || !isObject(value)) noObject = true;
        if(!value || !validAsImplicitSequence(value)) noSequence = true;
    }
    if(!noSequence){
        return sequencesEqual(...values);
    }else if(!noObject){
        return objectsEqual(...values);
    }else{
        return valuesEqual(...values);
    }
};

export default isEqual;
