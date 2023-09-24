import { useEffect, useState } from "react";
import API from "../backend/API";
import SocketManager from "../backend/SokcketManager";

export default function usePlayers(roomCode){
    // function to manage details about the players in the room,
    const [thisUserLeft, setThisUserLeft] = useState(false);
    const [alias, setAlias] = useState("");
    const [players, setPlayers] = useState(new Array());
    const [isHost, setIsHost] = useState(false);
    const [hostLeft, setHostLeft] = useState(false);

    useEffect(() => {
        // set the players when the component mounts...
        const getPlayers = async () => {
            const response = await API.get('get-current-players');
            if (!response.statusText == "OK") {
                return
            }
            setPlayers(response.data.data);
        }
        getPlayers();
        SocketManager.onEvent('player_leave',  (data) => {
            setPlayers(previous => previous.filter(alias => alias != data.alias))
        });
        SocketManager.onEvent('player_add', (data) => {
            setPlayers(previous => Array.from(
                new Set([...previous, data.alias])
            ));
        });
        SocketManager.onEvent('host_leave', (_) => setHostLeft(true))
    }, []);

    useEffect(() => {
        // when we set the alias to a non-null value, send an update to the room
        if (alias) {
            SocketManager.send('player_add', {alias: alias});
        }
    }, [alias]);

    useEffect(() => {
        // if we leave the room and set thisUserLeft, send an event to the room. If we are the 
        // host, then we send a host_leave event, otherwise a 'player_leave' event.
        if (thisUserLeft){
            if (isHost){
                SocketManager.send('host_leave', {
                    room_code: roomCode,
                })
            } else {
                SocketManager.send('player_leave', {
                    alias: alias,
                });
            }
        };
    }, [thisUserLeft]);
    
    return {
        thisUserLeft: thisUserLeft, 
        setThisUserLeft: setThisUserLeft,
        alias: alias,
        setAlias, setAlias,
        players: players,
        setPlayers: setPlayers,
        isHost: isHost,
        setIsHost: setIsHost,
        hostLeft: hostLeft,
        setHostLeft: setHostLeft,
    }
};