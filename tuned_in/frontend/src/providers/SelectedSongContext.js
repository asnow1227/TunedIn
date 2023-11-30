import React, { createContext, useContext } from "react";

const SongSelectionContext = createContext(undefined);
export default SongSelectionContext;

export function useSongSelectionContext(){
    const songSelectionContext = useContext(SongSelectionContext);
    if (songSelectionContext === undefined){
        throw Error("useSongSelectionContext requires SongSelectionContext Provider");
    }
    return songSelectionContext;
};