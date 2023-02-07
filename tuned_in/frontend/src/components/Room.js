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
                const authUrlResponse = await fetch('/spotify/get-auth-url');
                const authUrlData = await authUrlResponse.json();
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
            console.log(data);
            if (data.event_type == 'host_leave' & !isHost){
                props.leaveRoomCallback();
                navigate('/');
            }
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

    const sendSocketMessage = () => {
        if (socket == null){
            console.log('oops')
            return
        }
        const username = isHost ? 'host' : 'guest';
        socket.send(JSON.stringify({
            'message': 'hello!',
            'username': username
        }));
    }

    const renderSettingsButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={sendSocketMessage}>
                    Settings
                </Button>
            </Grid>
        )
    };

    const leaveRoom = async () => {
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
        }
        fetch('/api/leave-room', requestOptions).then((_response) => {
            if (isHost){
                socket.send(JSON.stringify({
                    type: 'host_leave',
                    data: {
                        room_code: roomCode
                    }
                }));
            }
            props.leaveRoomCallback();
            return navigate('/')
        })
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
                {renderSettingsButton()
                /* isHost ? renderSettingsButton() : null */}
                <Grid item xs={12}>
                    <Button variant="contained" color="secondary" onClick={leaveRoom}> 
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
        </div> 
    )
}
