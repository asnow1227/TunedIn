import React, { createContext, useContext } from "react";

const SocketContext = createContext(undefined);
export default SocketContext;

export function useSocketContext(){
    const socketContext = useContext(SocketContext);
    if (socketContext === undefined){
        throw Error("useSocketContext requires SocketContext Provider");
    }
    return socketContext;
}