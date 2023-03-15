import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";
import QueuePage from "./QueuePage";
import CreatePromptsPage from "./EnterPromptsPage"


class SocketManager {
    constructor(chatSocket=null){
        this.socket = chatSocket;
        this.functions = new Map();
        this.routeMessage = this.routeMessage.bind(this);
        this.removeEvent = this.removeEvent.bind(this);
        this.onEvent = this.onEvent.bind(this);
        this.send = this.send.bind(this);
        this.removeEvents = this.removeEvents.bind(this);
        this.setSocket = this.setSocket.bind(this);
        if (this.socket != null){
            this.socket.onmessage = this.routeMessage;
        }
    }
    setSocket(socket){
        this.socket = socket;
        this.socket.onmessage = this.routeMessage;
    }
    routeMessage(e){
        let data = JSON.parse(e.data);
        try {
            return this.functions[data.type](data.data)
        } catch (error) {
            console.log(data.type);
        }
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
    close(){
        if (this.socket == null){
            return
        }
        this.socket.close();
    }
}

// const GameStateMap = {
//     'queue': QueuePage,
//     'prompts': CreatePromptsPage,
//     'round': null,
//     'listen': null,
//     'voting': null,
//     'score': null
// }

// class GameStateRouter {
//     static dependencies = new Map();
//     static mapGamestate(gamestate) {
//         //add logic for the rounds and voting here
//         var props = {}
//         if (GameStateRouter.dependencies.has(gamestate)){
//             props = GameStateRouter.dependencies[gamestate]
//         }
//         return GameStateMap[gamestate](props)
//     }
//     static setDependencies(gamestate, props) {
//         GameStateRouter.dependencies[gamestate] = props
//     }
// }

const socketManager = new SocketManager();

export default function Room(props) {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    // const[socketManager, setSocketManager] = useState(new SocketManager());
    const[alias, setAlias] = useState("");
    const[isLoading, setIsLoading] = useState(true);
    const[gamestate, setGamestate] = useState("");

    const navigate = useNavigate();
    
    const { roomCode } = useParams();

    useEffect(() => {
        const setupRoomDetails = async () => {
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
                setAlias(roomData.alias); 
                setGamestate(roomData.gamestate);
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

        const setupSocket = async () => {
            const chatSocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
            socketManager.onEvent('connection_established', (data) => {
                console.log(data);
            });
            socketManager.setSocket(chatSocket);
            socketManager.onEvent('host_leave', function(_data){
                if (!isHost){
                    props.leaveRoomCallback();
                    navigate('/');
                }
            });
            socketManager.onEvent('message', function(data){
                console.log(data);
            });
            socketManager.onEvent('gamestate_update', function(data){
                setGamestate(data.gamestate);
                console.log(data.gamestate)
            })
        }

        const setup = async () => {
            //isLoading is used to control the render of different components, we want all our 
            //state variables to be loaded on this page before any child components are rendered that 
            //depend on them as props. We place the operations to set up the state variables in async functions
            //and await their resolve before setting the isLoading variable to false here.
            setIsLoading(true);
            await setupRoomDetails();
            await setupSocket();
            setIsLoading(false);
        }

        setup();

    }, []);

    const leaveRoom = () => {
        //set isLoading to true here as this function as an async alone was rerendering child components
        setIsLoading(true);
        const leave = async () => {
            const requestOptions = {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
            }
            await fetch('/api/leave-room', requestOptions);
            if (isHost){
                socketManager.send('host_leave', {
                    room_code: roomCode,
                })
            } else {
                socketManager.send('player_leave', {
                    alias: alias,
                })
            }
            socketManager.close();
            setAlias("");
            props.leaveRoomCallback();
            return navigate('/')
        };
        leave();
    }

    const renderGameState = () => {
        if (gamestate == ""){
            return null
        }
        if (gamestate == 'queue'){
            return <QueuePage alias={alias} isHost={isHost} socketManager={socketManager} />
        }
        if (gamestate == 'prompts'){
            return <CreatePromptsPage isHost={isHost} socketManager={socketManager}/>
        }
    }

    return (
        <div className="center">
            <Grid container spacing={1} align="center">
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Code: {roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    {
                    isLoading ? null : renderGameState()}
                </Grid>
                {gamestate == 'queue' ? <Grid item xs={12}>
                    <Button variant="contained" color="secondary" onClick={leaveRoom}> 
                        Leave Room
                    </Button>
                </Grid>: null}
            </Grid>
        </div> 
    )
}
