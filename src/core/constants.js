export const constants = {
    Promise: Promise,
    
    defaults: {
        comparisonFunction: (a, b) => (a === b),
        orderingFunction: (a, b) => (a < b ? -1 : (a > b) ? +1 : 0),
        predicateFunction: (a) => (a),
        relationalFunction: (a, b) => (a < b),
        transformationFunction: (a) => (a),
        
        limitLength: 1000,
    }
};

export default constants;
