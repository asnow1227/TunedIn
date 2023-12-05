import React from "react";
import { useUserContext } from "../providers/UserContext";
import { useSocketContext } from "../providers/SocketContext";
import API from "../backend/API";


export default function useUserReady(){
    const { user } = useUserContext();
    const socketManager = useSocketContext();

    const setUserReady = async () => {
        await API.post('ready-up');
        socketManager.send('player_update', {
            player_id: user.id,
            isReady: true
        });
    }

    return setUserReady;
}