import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";
import QueuePage from "./QueuePage";


class SocketManager {
    constructor(chatSocket=null){
        this.socket = chatSocket;
        this.functions = new Map();
        this.routeMessage = this.routeMessage.bind(this);
        this.removeEvent = this.removeEvent.bind(this);
        this.onEvent = this.onEvent.bind(this);
        this.send = this.send.bind(this);
        this.removeEvents = this.removeEvents.bind(this);
        if (this.socket != null){
            this.socket.onmessage = this.routeMessage;
        }
    }
    addSocket(socket){
        this.socket = socket;
        this.socket.onmessage = this.routeMessage;
    }
    routeMessage(e){
        let data = JSON.parse(e.data);
        console.log(data);
        return this.functions[data.type](data.data)
    }
    onEvent(event_type, func){
        this.functions[event_type] = func;
    }
    removeEvent(event_type){
        this.functions.delete(event_type);
    }
    removeEvents(events){
        events.forEach(event => this.functions.delete(event));
    }
    send(event_type, data=null){
        if (this.socket == null){
            return
        }
        const message = JSON.stringify({
            type: event_type,
            data: data
        });
        if (this.socket.readyState === 1) {
            this.socket.send(message);
        } else {
            this.socket.onopen = () => this.socket.send(message);
        }
    }
}

export default function Room(props) {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const[showSettings, setShowSettings] = useState(false);
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const[isConnected, setIsConnected] = useState(false)
    // const[socket, setSocket] = useState(null);
    const[socketManager, setSocketManager] = useState(new SocketManager());
    const[players, setPlayers] = useState(new Set());
    const[alias, setAlias] = useState("");

    const navigate = useNavigate();
    
    const { roomCode } = useParams();

    console.log(`alias: ${alias}`)

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
        const fetchPlayers = async () => {
            const response = await fetch('/api/get-current-players');
            if (!response.ok){
                return
            }
            const data = await response.json();
            data.data.forEach(alias => players.add(alias))
            setPlayers(players);
            const alias = data.data[0];
            setAlias(alias);

            const chatSocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
            socketManager.onEvent('connection_established', (data) => {
                console.log(data);
            });
            socketManager.onEvent('player_leave', (data) => {
                console.log(data);
                const previous = players;
                previous.delete(data.alias);
                setPlayers(new Set(previous));
            });
            socketManager.onEvent('player_add', (data) => {
                const previous = players;
                previous.add(data.alias);
                setPlayers(new Set(previous))
            });
            socketManager.addSocket(chatSocket);
            socketManager.onEvent('host_leave', function(_data){
                if (!isHost){
                    props.leaveRoomCallback();
                    navigate('/');
                }
            });
            socketManager.onEvent('message', function(data){
                console.log(data);
            });
            socketManager.send('player_add', {
                'alias': alias
            });
        }
        fetchPlayers();
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
        const username = isHost ? 'host' : 'guest';
        socketManager.send('message', {
            username: username,
        })
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
        console.log(alias);
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
        }
        fetch('/api/leave-room', requestOptions).then((_response) => {
            if (isHost){
                socketManager.send('host_leave', {
                    room_code: roomCode,
                })
            } else {
                console.log(alias);
                socketManager.send('player_leave', {
                    alias: alias,
                })
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
                <Grid item xs={12} align="center">
                    <QueuePage players={players} />
                </Grid>
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
