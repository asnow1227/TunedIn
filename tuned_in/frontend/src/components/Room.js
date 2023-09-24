import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography, Select, TextareaAutosize } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import API, { SPOTIFY_API, authenticateUsersSpotify } from "../backend/API"
import usePlayers from "../hooks/usePlayers";
import useGamestate from "../hooks/useGamestate";
import useSocketManager from "../hooks/useSocketManager";
import QueuePage from "./QueuePage";
import CreatePromptsPage from "./EnterPromptsPage"
import SelectSongPage from "./selectSongPageFunctional"

const PAGES = {
    'Q': QueuePage,
    'P': CreatePromptsPage,
    'SEL': SelectSongPage,
}

export default function Room(props) {
    const { roomCode } = useParams();
    useSocketManager(roomCode);
    const { thisUserLeft, setThisUserLeft, alias, setAlias, players, isHost, setIsHost, hostLeft } = usePlayers(roomCode);
    const[gamestate, setGamestate, isWaiting, setIsWaiting, isReady, setIsReady] = useGamestate();
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const[isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    const leave = () => {
        props.leaveRoomCallback();
        navigate('/');
    }

    useEffect(() => {
        // hostLeft will be handled by the userPlayers hook. If a player is
        // the host and they leave, then hostLeft will be true will trigger the call
        // to leave.
        if (hostLeft || thisUserLeft) {
            leave();
        }
    }, [hostLeft, thisUserLeft])

    useEffect(() => {
        const setRoomDetails = async () => {
            const response = await API.get('get-room?code=' + roomCode);
            if (!response.statusText == "OK") {
                leave();
            }
            setIsHost(response.data.is_host);
            setAlias(response.data.alias); 
            setGamestate(response.data.gamestate);
            setIsWaiting(response.data.is_waiting);
            return response.data.is_host;
        };
    
        const setAuthenticatedStatus = async () => {
            const response = await SPOTIFY_API.get('is-authenticated');
            setSpotifyAuthenticated(response.data.status);
            return response.data.status;
        };

        const setUp = async () => {
            const isHost = await setRoomDetails();
            if (isHost){
                const isSpotifyAuthenticated = await setAuthenticatedStatus();
                if (!isSpotifyAuthenticated){
                    await authenticateUsersSpotify();
                }
            }
        };

        setIsLoading(true);
        setUp();
        setIsLoading(false);
    
    }, []);

    const renderGameState = () => {
        if (isWaiting){
            return <Typography variant="h4" component="h4">Waiting...</Typography>
        }
        const Component = gamestate ? PAGES[gamestate] : null;
        const props = {
            alias: alias, 
            isHost: isHost,
            setIsReady: setIsReady,
            players: players,
        }
        return Component ? <Component {...props}/> : null;
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
                    <Button variant="contained" color="secondary" onClick={() => setThisUserLeft(true)}> 
                        End Game
                    </Button>
                </Grid>: null}
            </Grid>
        </div> 
    )
}
