import { useEffect } from "react";
import SocketManager from "../backend/SokcketManager";

export default function useSocketManager(roomCode){
    useEffect(() => {
        SocketManager.initialize(roomCode);
        return () => {
            SocketManager.close()
        } 
    }, []);
}