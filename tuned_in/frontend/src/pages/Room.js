import React, { useState,  useEffect, } from "react";
import { useParams } from "react-router-dom";  
import { Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import API, { SPOTIFY_API, authenticateUsersSpotify } from "../backend/API"
import SocketManager from "../backend/SocketManager";
import useObjectState from "../hooks/useObjectState";
import QueuePage from "./QueuePage";
import CreatePromptsPage from "./EnterPromptsPage"
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/Layout";

const PAGES = {
    'Q': QueuePage,
    'P': CreatePromptsPage,
    'SEL': SelectSongPage,
}

export default function Room(props) {
    const { roomCode } = useParams();
    const [user, setUser] = useObjectState({isHost: null, isWaiting: null, isReady: false, alias: ""});
    const [players, setPlayers] = useState(new Array());
    const [gamestate, setGamestate] = useState(null);
    const [playerAddTriggered, setPlayerAddTriggered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    const leave = () => {
        props.leaveRoomCallback();
        navigate('/');
    }

    useEffect(() => {
        SocketManager.initialize(roomCode);
        SocketManager.onEvents({
            gamestate_update: (data) => {
                setGamestate(data.gamestate);
                setUser({isWaiting: false, isReady: false});
            },
            player_leave: (data) => {
                if (data.alias == user.alias){
                    leave();
                } else {
                    setPlayers(prev => (prev.filter(alias => alias != data.alias)));
                }
            },
            player_add: (data) => {
                setPlayers(prev =>  (Array.from(new Set([...prev, data.alias]))));
            },
            host_leave: (_) => {
                leave();
            },
        });

        const setRoomAndUserDetails = async () => {
            try {
                const response = await API.get('get-room?code=' + roomCode);
                const data = response.data;
                setPlayers(data.players);
                setGamestate(data.gamestate);
                setUser({isWaiting: data.is_waiting, isReady: data.is_ready, isHost: data.is_host, alias: data.players[0]});
                return data.isHost;
            } catch {
                leave();
            }
        }

        const getAuthenticatedStatus = async () => {
            const response = await SPOTIFY_API.get('is-authenticated');
            return response.data.status;
        };

        const setUp = async () => {
            const isHost = await setRoomAndUserDetails();
            if (isHost){
                const isSpotifyAuthenticated = await getAuthenticatedStatus();
                if (!isSpotifyAuthenticated){
                    await authenticateUsersSpotify();
                }
            }
        };

        setIsLoading(true);
        setUp();
        setIsLoading(false);
       
    }, []);

    if (user.alias && !playerAddTriggered){
        setPlayerAddTriggered(true);
        SocketManager.send('player_add', {alias: user.alias});
    }

    const setUserReady = async () => {
        try {
            const response = await API.post('ready-up');
            setUser({isReady: true, isWaiting: response.data.is_waiting});
            if (!response.data.is_waiting){
                const response = await API.post('next-gamestate');
                SocketManager.send('gamestate_update', {gamestate: response.data.gamestate});
            }
        } catch {
            alert("Error setting user to ready");
        }
    };

    const leaveButtonPressed = () => {
        if (user.isHost) {
            SocketManager.send('host_leave', {room_code: roomCode});
        }
        else {
            SocketManager.send('player_leave', {alias: user.alias});
        }
    };

    const renderGameState = () => {
        if (user.isWaiting){
            return <Typography variant="h4" component="h4">Waiting...</Typography>
        }
        const Component = gamestate ? PAGES[gamestate] : null;
        const props = {
            alias: user.alias, 
            isHost: user.isHost,
            setUserReady: setUserReady,
            players: players,
            roomCode: roomCode,
            leaveButtonPressed: leaveButtonPressed
        }
        return Component ? <Component {...props}/> : null;
    }

    return (
        <MainBox>
            {/* <Header align="center">
                <Grid container >
                    <Grid item xs={12}>
                        <Typography color="textSecondary" variant="subtitle1">
                            Alias: {user.alias}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography color="textSecondary" variant="subtitle1">
                            Room Code: {roomCode}
                        </Typography>
                    </Grid>
                </Grid>    
            </Header> */}
                {!isLoading && renderGameState()}
            {/* <Footer align="center">
                {user.isHost && 
                <Button variant="contained" color="secondary" onClick={leaveButtonPressed}> 
                    End Game
                </Button>}
            </Footer> */}
        </MainBox>
    )
}
