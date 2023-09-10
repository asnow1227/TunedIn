import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";


export default function QueuePage(props){
    console.log('actually wtf')
    const[players, setPlayers] = useState(new Array());
    const[isReady, setIsReady] = useState(false);

    useEffect(() => {
        const setup = async () => {
            const fetchPlayers = async () => {
                try {
                    const response = await fetch('/api/get-current-players');
                    if (!response.ok){
                        return
                    }
                    const data = await response.json();
                    console.log(data.data);
                    setPlayers(data.data);
                } catch (error) {
                    console.log(error);
                }
            };
            const addSocketEvents = async () => {
                props.socketManager.onEvent('player_leave', (data) => {
                    setPlayers(previous => previous.filter(alias => alias != data.alias));
                });
                props.socketManager.onEvent('player_add', (data) => {
                    setPlayers(previous => Array.from(
                        new Set([...previous, data.alias])
                    ));
                });
            };
            await fetchPlayers();
            await addSocketEvents();
            props.socketManager.send('player_add', {
                'alias': props.alias,
            });
        };
        setup();

        return () => {
            props.socketManager.removeEvents(['player_add', 'player_leave']);
        }
    }, []);

    // const updateReadyStatus = async () => {
    //     const requestOptions = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             is_ready: !isReady
    //         }),
    //     }

    //     const response = await fetch('/api/update-ready-status', requestOptions);
    //     if (!response.ok){
    //         alert('error updating ready status')
    //     }
    //     setIsReady(ready => !ready);
    //     if (!props.isHost) return;
    //     updateGameState();
    // }

    return (
        <div align="center">
            <Typography variant="h3" component="h3">
                Queue 
            </Typography>
            {players.map(function(alias, i){
                return (
                    <div key={i}>
                        <Typography variant="h4" component="h4">
                            {alias}
                        </Typography>
                    </div>
                )
            })}
            {props.isHost ? 
                <Button variant="contained" color="primary" onClick={props.updateGameState}> 
                    {isReady ? "Not Ready" : "Ready"}
                </Button>
             : null}
        </div>
    )
}