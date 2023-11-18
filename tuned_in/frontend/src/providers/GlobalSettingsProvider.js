import React, { createContext, useContext } from "react";

const GlobalSettingsContext = createContext(undefined);
export default GlobalSettingsContext;

export function useGlobalSettingsContext(){
    const globalSettingsContext = useContext(GlobalSettingsContext);
    if (globalSettingsContext === undefined){
        throw Error("globalSettingsContext requires GlobalSettingsContext Provider");
    }
    return globalSettingsContext;
};