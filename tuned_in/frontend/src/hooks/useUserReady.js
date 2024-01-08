import React from "react";
import { useUserContext } from "../contexts/UserContext";
import { useSocketContext } from "../contexts/SocketContext";
import { useGamestateContext } from "../contexts/GameStateContext";
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