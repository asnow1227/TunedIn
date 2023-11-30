import React, { createContext, useContext } from "react";

const SpotifyQueryContext = createContext(undefined);
export default SpotifyQueryContext;

export function useSpotifyQueryContext(){
    const spotifyQueryContext = useContext(SpotifyQueryContext);
    if (spotifyQueryContext === undefined){
        throw Error("useSpotifyQueryContext requires SpotifyQueryContext Provider");
    }
    return spotifyQueryContext;
};