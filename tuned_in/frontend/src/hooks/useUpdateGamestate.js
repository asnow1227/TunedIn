import React from "react";
import { useSocketContext } from "../contexts/SocketContext";
import API from "../backend/API";


export default function useUpdateGamestate(){
    const socketManager = useSocketContext();

    const updateGamestate = async (isHost) => {
        try {
            const response = await API.post('next-gamestate');
            socketManager.send('gamestate_update', {
                gamestate: response.data.gamestate
            });
            if (isHost) {
                socketManager.send('kill_host_timer');
                ///need to call this so that when we ready up before the timer, we kill the current timer running on the socket consumer.
            }
        } catch (error) {
            console.log(error.response);
        }
    };

    return updateGamestate;
}