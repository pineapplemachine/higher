import {lightWrap} from "./lightWrap";

// Implementation shared by addSequenceConverter and addConsumerConverter.
export const addConverter = lightWrap({
    internal: true,
    summary: "Register a new object in some list of objects.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function addConverter(object, list){
        let lowest = undefined;
        let highest = undefined;
        for(let i = 0; i < list.length; i++){
            const existing = list[i];
            if(
                (object.converter.after && object.converter.after[existing.name]) ||
                (existing.converter.before && existing.converter.before[object.name])
            ){
                lowest = i + 1;
            }
            if(highest === undefined && (
                (object.converter.before && object.converter.before[existing.name]) ||
                (existing.converter.after && existing.converter.after[object.name])
            )){
                highest = i;
            }
        }
        if(highest === undefined){
            list.push(object);
        }else if(lowest === undefined || highest >= lowest){
            list.splice(highest, 0, object);
        }else{
            throw new Exception(
                `Unable to place object ${object.name} because ` +
                "of conflicting ordering information."
            );
        }
    },
});

export default addConverter;
