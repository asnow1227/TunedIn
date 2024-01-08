import React from "react";
import { useParams } from "react-router-dom";
import SocketManager from "../backend/SocketManager";
import SocketContext from "./SocketContext";

export default function SocketProvider({ children, code }){
    let { roomCode } = useParams();
    if (code) roomCode = code;
    const socketManager = new SocketManager(roomCode);
    return (
        <SocketContext.Provider value={socketManager}>
            {children}
        </SocketContext.Provider>
    )
};