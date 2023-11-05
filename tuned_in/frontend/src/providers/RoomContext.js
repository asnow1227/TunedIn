import React, { createContext, useContext } from "react";

const RoomContext = createContext(undefined);
export default RoomContext;

export function useRoomContext(){
    const RoomContext = useContext(RoomContext);
    if (RoomContext === undefined){
        throw Error("useHomePageContext requires HomePageContext Provider");
    }
    return RoomContext;
};