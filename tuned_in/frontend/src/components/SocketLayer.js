import React from "react";
import { useParams } from "react-router-dom";
import SocketManager from "../backend/SocketManager";
import SocketContext from "../contexts/SocketContext";

export default function SocketProvider({ children }){
    const { roomCode } = useParams();
    const socketManager = new SocketManager(roomCode);
    return (
        <SocketContext.Provider value={socketManager}>
            {children}
        </SocketContext.Provider>
    )
}