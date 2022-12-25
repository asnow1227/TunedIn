import React, { useState } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";


export default function Room(props) {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const navigate = useNavigate();
    
    const { roomCode } = useParams();

    fetch('/api/get-room?code='+roomCode)
    .then((response) => {
        if (!response.ok) {
            props.leaveRoomCallback();
            return navigate('/')
        }
        return response.json();
        })
    .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
    });


    return (
        <Grid container spacing={1} align="center">
            <Grid item xs={12}>
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Votes: {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {String(guestCanPause)}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                    Host: {String(isHost)}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="secondary" onClick={() => {
                    const requestOptions = {
                        method: "POST",
                        headers: {'Content-Type': 'application/json'},
                    }
                    fetch('/api/leave-room', requestOptions).then((_response) => {
                        props.leaveRoomCallback();
                        return navigate('/')
                    })
                }}> 
                    Leave Room
                </Button>
            </Grid>
        </Grid>
        
    )
}
