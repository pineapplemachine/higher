// Join a series of strings with "and"s and commas.
export const joinSeries = function(series, joinWord = undefined){
    const join = joinWord || "and";
    if(series.length === 0) return "";
    else if(series.length === 1) return series[0].toString();
    let string = "";
    for(let i = 0; i < series.length; i++){
        const item = series[i];
        if(series.length === 2 && i === 1) string += ` ${join} `;
        else if(i === series.length - 1) string += `, ${join} `;
        else if(i > 0) string += ", ";
        string += item.toString();
    }
    return string;
};

// Get a human-friendly place name such as "first" or "third" or "22nd".
export const placeName = function(n){
    const strings = [
        "zeroth", "first", "second", "third", "fourth",
        "fifth", "sixth", "seventh", "eighth", "ninth",
    ];
    if(Math.abs(n) <= strings.length){
        return n >= 0 ? strings[n] : "negative " + strings[n];
    }else{
        const lastDigit = Math.abs(n) % 10;
        if(lastDigit === 1) return n + "st";
        else if(lastDigit === 2) return n + "nd";
        else if(lastDigit === 3) return n + "rd";
        else return n + "th";
    }
};

// Get a human-friendly number name such as "zero" or "one" or "three" or "22".
export const numberName = function(n){
    const strings = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
        "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    ];
    if(Math.abs(n) <= strings.length){
        return n >= 0 ? strings[n] : "negative " + strings[n];
    }else{
        return "" + n;
    }
};

// Get a human-friendly quantity name such as "none" or "one" or "three" or "22".
export const quantityName = function(n){
    return n ? numberName(n) : "none";
};
