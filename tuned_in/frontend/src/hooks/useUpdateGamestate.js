import React from "react";
import { useSocketContext } from "../providers/SocketContext";
import API from "../backend/API";


export default function useUpdateGamestate(){
    const socketManager = useSocketContext();

    const updateGamestate = async () => {
        try {
            const response = await API.post('next-gamestate');
            socketManager.send('gamestate_update', {
                gamestate: response.data.gamestate
            });
        } catch (error) {
            console.log(error.response);
        }
    };

    return updateGamestate;
}