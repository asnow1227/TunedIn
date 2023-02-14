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

        const setUp = async () => {
            try {
                const response = await fetch('/api/get-current-players');
                if (!response.ok){
                    return
                }
                const data = await response.json();
                setPlayers(data.data);
                props.socketManager.onEvent('player_leave', (data) => {
                    setPlayers(previous => previous.filter(alias => alias != data.alias));
                });
                props.socketManager.onEvent('player_add', (data) => {
                    setPlayers(previous => Array.from(
                        new Set([...previous, data.alias])
                    ));
                });
            } catch (error) {
                console.log(error);
            }
        };

        if (!props.alias == ""){
            setUp();
            props.socketManager.send('player_add', {
                'alias': props.alias,
            });
        }

        return () => {
            props.socketManager.removeEvents(['player_add', 'player_leave']);
        }
    }, [props]);

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
        </div>
    )
}