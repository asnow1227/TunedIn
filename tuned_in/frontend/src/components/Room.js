import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";


// const socket = io.connect(`ws://${window.location.host}/ws/socket-server`);

export default function Room(props) {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const[showSettings, setShowSettings] = useState(false);
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const[isConnected, setIsConnected] = useState(false)

    const navigate = useNavigate();
    
    const { roomCode } = useParams();

    console.log("refreshed");

    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/socket-server`)

    chatSocket.onmessage = function(e){
        let data = JSON.parse(e.data)
        console.log(data)
    }

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
        if (isHost){
            fetch('/spotify/is-authenticated')
            .then((response) => response.json())
            .then((data) => {
                setSpotifyAuthenticated(data.status);
                if(!data.status) {
                    fetch('/spotify/get-auth-url')
                    .then((response) => response.json())
                    .then((data) => {
                        window.location.replace(data.url);
                    });
                }
            });
        }
    });

    const renderSettings = () => {
        return (
            <div className="center">
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage {...props}
                        update={true} 
                        votesToSkip={votesToSkip} 
                        guestCanPause={guestCanPause} 
                        roomCode={roomCode}
                        updateCallback={null}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={() => setShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
            </div>
        )
    };

    const renderSettingsButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => setShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        )
    };

    if (showSettings) {
        return renderSettings();
    };

    return (
        <div className="center">
            <Grid container spacing={1} align="center">
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Code: {roomCode}
                    </Typography>
                </Grid>
                <MusicPlayer />
                {isHost ? renderSettingsButton() : null}
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
        </div> 
    )
}
