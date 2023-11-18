import React, { createContext, useContext } from "react";

const GamestateContext = createContext(undefined);
export default GamestateContext;

export function useGamestateContext(){
    const gamestateContext = useContext(GamestateContext);
    if (gamestateContext === undefined){
        throw Error("useGamestateContext requires GamestateContext Provider");
    }
    return gamestateContext;
};