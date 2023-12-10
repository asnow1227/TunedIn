import React from "react";
import { useUserContext } from "../providers/UserContext";
import { useSocketContext } from "../providers/SocketContext";
import { useGamestateContext } from "../providers/GameStateContext";
import API from "../backend/API";


export default function useUserReady(){
    const { user } = useUserContext();
    const socketManager = useSocketContext();
    const { setGamestate } = useGamestateContext();

    const setUserReady = async () => {
        await API.post('ready-up');
        setGamestate(null);
        /// this line is to protect against remounting components before a gamestate is updated
        socketManager.send('player_update', {
            player_id: user.id,
            isReady: true
        });
    }

    return setUserReady;
}