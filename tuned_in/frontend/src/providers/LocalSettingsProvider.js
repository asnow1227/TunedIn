import React, { createContext, useContext } from "react";

const LocalSettingsContext = createContext(undefined);
export default LocalSettingsContext;

export function useLocalSettingsContext(){
    const localSettingsContext = useContext(LocalSettingsContext);
    if (localSettingsContext === undefined){
        throw Error("localSettingsContext requires LocalSettingsContext Provider");
    }
    return localSettingsContext;
};