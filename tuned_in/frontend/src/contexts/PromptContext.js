import React, { createContext, useContext } from "react";

const PromptContext = createContext(undefined);
export default PromptContext;

export function usePromptContext(){
    const promptContext = useContext(PromptContext);
    if (promptContext === undefined){
        throw Error("usePromptContext requires PromptContext Provider");
    }
    return promptContext;
};