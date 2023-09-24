import { useEffect, useState } from "react";
import API from "../backend/API";
import SocketManager from "../backend/SokcketManager";

export default function useGamestate(){
    const [gamestate, setGamestate] = useState(null); 
    const [isWaiting, setIsWaiting] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        SocketManager.onEvent('gamestate_update', (data) => {
            setGamestate(data.gamestate);
            setIsWaiting(false);
            setIsReady(false);
        });
    }, []);

    useEffect(() => {
        const readyUp = async () => {
            if (!isReady){
                return
            }
            const response = await API.post('ready-up');
            if (!response.statusText == "OK"){
                return
            }
            if (response.data.isWaiting){
                setIsWaiting(true);
            } else {
                // if api returns we aren't waiting then we are good to update the gamestate
                const response = await API.post('next-gamestate');
                response.statusText == "OK" ? SocketManager.send('gamestate_update', {
                    'gamestate': response.data.gamestate
                }) : null;
            }
        };
        readyUp();
    }, [isReady]);

    return [gamestate, setGamestate, isWaiting, setIsWaiting, isReady, setIsReady];
};