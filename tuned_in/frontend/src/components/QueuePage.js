import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";


export default function QueuePage(props){

    const[players, setPlayers] = useState(new Array());

    useEffect(() => {
        const setup = async () => {
            const fetchPlayers = async () => {
                try {
                    const response = await fetch('/api/get-current-players');
                    if (!response.ok){
                        return
                    }
                    const data = await response.json();
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

    const updateGamestate = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        }
        
        const response = await fetch('/api/next-gamestate', requestOptions);
        if (!response.ok){
            return
        }
        const data = await response.json();
        props.socketManager.send('gamestate_update', {
            gamestate: data.gamestate
        });
    }

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
                <Button variant="contained" color="primary" onClick={updateGamestate}> 
                    Ready
                </Button>
             : null}
        </div>
    )
}