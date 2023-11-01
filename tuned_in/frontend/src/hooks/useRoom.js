import React, { useState, useEffect } from "react";
import SocketManager from '../backend/SocketManager';
import { useNavigate, useParams } from "react-router-dom";  
import useObjectState from "./useObjectState";
import { useSocketContext } from "../contexts/SocketContext";
import { useHomePageContext } from "../contexts/HomePageContext";
import API from "../backend/API";

export default function useRoom() {
    const { roomCode } = useParams();
    const [user, setUser] = useObjectState({isHost: null, isWaiting: null, isReady: false, alias: ""});
    const [players, setPlayers] = useState(new Array());
    const [gamestate, setGamestate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playerAddTriggered, setPlayerAddTriggered] = useState(false);
    const socketManager = useSocketContext();
    const leaveRoomCallback = useHomePageContext();
    const navigate = useNavigate();
    
    const leave = () => {
        console.log('Leave Room Called within Room')
        leaveRoomCallback();
        navigate('/');
    }

    useEffect(() => {
        // SocketManager.initialize(roomCode);
        socketManager.onEvents({
            gamestate_update: (data) => {
                setGamestate(data.gamestate);
                setUser({isWaiting: false, isReady: false});
            },
            player_leave: (data) => {
                leave();
                // if (data.alias == user.alias){
                //     leave();
                // } else {
                //     setPlayers(prev => (prev.filter(alias => alias != data.alias)));
                // }
            },
            player_add: (data) => {
                console.log(data.player);
                setPlayers((prev) => prev.some(player => player.id == data.player.id) ? prev : [...prev, data.player]);
            },
            host_leave: (_) => {
                console.log('host leave called');
                leave();
            },
        });

        const setRoomAndUserDetails = async () => {
            try {
                const response = await API.get('get-room?code=' + roomCode);
                const data = response.data;
                setPlayers([data.user, ...data.players]);
                setGamestate(data.gamestate);
                const user = {isWaiting: data.user.is_ready && data.players.some(player => !player.is_ready), ...data.user}
                setUser(user);
            } catch {
                leave();
            }
        }

        // const getAuthenticatedStatus = async () => {
        //     const response = await SPOTIFY_API.get('is-authenticated');
        //     return response.data.status;
        // };

        // const setUp = async () => {
        //     const isHost = await setRoomAndUserDetails();
        //     if (isHost){
        //         const isSpotifyAuthenticated = await getAuthenticatedStatus();
        //         if (!isSpotifyAuthenticated){
        //             await authenticateUsersSpotify();
        //         }
        //     }
        // };

        // setIsLoading(true);
        setRoomAndUserDetails();
        setIsLoading(false);
       
        console.log('This Useeffect was called');
    }, []);

    if (user.alias && !playerAddTriggered){
        setPlayerAddTriggered(true);
        socketManager.send('player_add', {player: user});
    }

    return { roomCode, user, players, gamestate, isLoading }
};