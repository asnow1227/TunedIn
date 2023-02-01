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
    const[socket, setSocket] = useState(null);

    const navigate = useNavigate();
    
    const { roomCode } = useParams();

    var chatSocket = null;

    console.log("refreshed");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomResponse = await fetch('/api/get-room?code=' + roomCode);
                if (!roomResponse.ok) {
                    props.leaveRoomCallback();
                    return navigate('/')
                }
                const roomData = await roomResponse.json();
                setVotesToSkip(roomData.votes_to_skip);
                setGuestCanPause(roomData.guest_can_pause);
                setIsHost(roomData.is_host);
                if (!roomData.is_host) return;
                const authenicatedResponse = await fetch('/spotify/is-authenticated');
                const authenticatedData = await authenicatedResponse.json();
                setSpotifyAuthenticated(authenticatedData.status);
                if (authenticatedData.status) return;
                authUrlResponse = await fetch('/spotify/get-auth-url');
                authUrlData = await authUrlResponse.json();
                window.location.replace(authUrlData.url);
            } catch (error) {
                console.log(error);
            }
        };
    
    fetchData();
    }, []);

    useEffect(() => {
        const chatSocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
        chatSocket.onmessage = function(e) {
            let data = JSON.parse(e.data)
            console.log(data)
        }
        setSocket(chatSocket);
    }, []);

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
