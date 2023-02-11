import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";

export default function QueuePage(props){
    const players = Array.from(props.players);
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