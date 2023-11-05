import React, { createContext, useContext } from "react";

const HomePageContext = createContext(undefined);
export default HomePageContext;

export function useHomePageContext(){
    const homePageContext = useContext(HomePageContext);
    if (homePageContext === undefined){
        throw Error("useHomePageContext requires HomePageContext Provider");
    }
    return homePageContext;
}