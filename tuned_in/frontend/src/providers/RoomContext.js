import React, { createContext, useContext } from "react";

const RoomContext = createContext(undefined);
export default RoomContext;

export function useRoomContext(){
    const roomContext = useContext(RoomContext);
    if (roomContext === undefined){
        throw Error("useRoomContext requires RoomContext Provider");
    }
    return roomContext;
};