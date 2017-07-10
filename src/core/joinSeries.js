// Join a series of strings with "and"s and commas.
export const joinSeries = function(series, joinWord = undefined){
    const word = joinWord || "and";
    if(series.length === 0) return "";
    else if(series.length === 1) return series[0].toString();
    let string = "";
    for(let i = 0; i < series.length; i++){
        const item = series[i];
        if(series.length === 2 && i === 1) string += ` ${joinWord} `;
        else if(i === series.length - 1) string += `, ${joinWord} `;
        else if(i > 0) string += ", ";
        string += item.toString();
    }
    return string;
};

export default joinSeries;
