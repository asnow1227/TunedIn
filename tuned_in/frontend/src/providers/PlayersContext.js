import React, { createContext, useContext } from "react";

const PlayersContext = createContext(undefined);
export default PlayersContext;

export function usePlayersContext(){
    const playersContext = useContext(PlayersContext);
    if (playersContext === undefined){
        throw Error("useHomePageContext requires HomePageContext Provider");
    }
    return playersContext;
}