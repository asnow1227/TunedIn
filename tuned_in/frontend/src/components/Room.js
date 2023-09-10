import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography, Select } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import io from "socket.io-client";
import QueuePage from "./QueuePage";
import CreatePromptsPage from "./EnterPromptsPage"
import Prompt from "./Prompt"
import SelectSongPage from "./selectSongPageFunctional"

// this class is a wrapper around the standard socket object provided in js
// this creates a mapping of event names -> callback functions
// set up this way to allow us to add callback functions easily from child 
// components of this room page, by passing the socket manager as a prop.
// the socket manager callback will have access to state variables of the child component if they 
// are necessary.
// this works as follows:
//      add the socket manager object after creating it in the room page component with the setSocket method
//          this hijacks the 'onmessage' function of the socket object to use the 'routeMessage' function of the SocketManager
//      define events with the onEvent method (from any component that inherits the socketManager as a prop)
//          this takes a string and a callback function and adds the callback function to a map by the event name          
//      when the socket recieves an event from its consumer:
//          the SocketManager looks for a corresponding callback function in the 'functions' map and calls it on the passed 'data' attribute
//          ** this means that the consumer must pass the data in the form 
//                  {
//                      'type': .. the event type that tells the SocketManager which function to route the message to,
//                      'data': .. the actual data to pass to the function that maps to the event type
//                  }
//              you will see this mirrored in the tuned_in/game/consumers.py file with the jsonSocketMessage object 
// **Note that it may be better to define a global variable so we don't have to set this as a state variable on the room component and pass it as props,
// **other components could just access this by importing it
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

const socketManager = new SocketManager();

const initializeSocketManager = (roomCode) => {
    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
    socketManager.onEvent('connection_established', (data) => {
        console.log(data);
    });
    socketManager.setSocket(chatSocket);
}

export default function Room(props) {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    // const[socketManager, setSocketManager] = useState(new SocketManager());
    const[alias, setAlias] = useState("");
    const[isLoading, setIsLoading] = useState(true);
    const[gamestate, setGamestate] = useState("");
    const[isWaiting, setIsWaiting] = useState(false);

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
                setIsWaiting(roomData.is_waiting);
                console.log(roomData.gamestate);
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
            // const chatSocket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
            // socketManager.onEvent('connection_established', (data) => {
            //     console.log(data);
            // });
            // socketManager.setSocket(chatSocket);
            initializeSocketManager(roomCode);
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
                setIsWaiting(false);
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

    const updateGameState = async () => {
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
        socketManager.send('gamestate_update', {
            gamestate: data.gamestate
        });
    }

    const readyUpCallback = () => {
        // callback to set ready status for a player
        setIsLoading(true);
        const readyUp = async () => {
            console.log('readyUpCalled');
            const requestOptions = {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
            }
            const roomReadyStatus = await fetch('/api/ready-up', requestOptions);
            // the ready-up endpoint checks if other players aren't ready and returns back
            // true if so, otherwise, we update the gamestate
            if (!roomReadyStatus.ok) {
                return
            }
            const data = await roomReadyStatus.json();
            if (data.is_waiting){
                setIsWaiting(true);
            }
            else {
                // if we aren't waiting on anyone then we are ready, send a gamestate update
                updateGameState();
            }
            return
        }
        readyUp();
        setIsLoading(false);  
    }

    const renderGameState = () => {
        if (isWaiting){
            return <Typography variant="h4" component="h4">Waiting...</Typography>
        }
        if (gamestate == ""){
            return null
        }
        if (gamestate == 'Q'){
            return <QueuePage alias={alias} isHost={isHost} socketManager={socketManager} updateGameState={updateGameState}/>
        }
        if (gamestate == 'P'){
            return <CreatePromptsPage isHost={isHost} socketManager={socketManager} readyUpCallback={readyUpCallback}/>
        }
        if (gamestate == 'SEL'){
            return <SelectSongPage />
        }
    }

    return (
        <div className="center" width="100%">
            <Grid container spacing={1} align="center">
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Code: {roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Alias: {alias}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    {
                    isLoading ? null : renderGameState()}
                </Grid>
                {isHost ? <Grid item xs={12}>
                    <Button variant="contained" color="secondary" onClick={leaveRoom}> 
                        End Game
                    </Button>
                </Grid>: null}
            </Grid>
        </div> 
    )
}
