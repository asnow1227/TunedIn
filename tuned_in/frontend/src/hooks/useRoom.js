import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";  
import { useSocketContext } from "../contexts/SocketContext";
import { useHomePageContext } from "../contexts/HomePageContext";
import API from "../backend/API";

export default function useRoom() {
    const { roomCode } = useParams();
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
        socketManager.onEvents({
            gamestate_update: (data) => {
                setGamestate(data.gamestate);
                setUser({isWaiting: false, isReady: false});
            },
            player_leave: (data) => {
                leave();
            },
            player_add: (data) => {
                console.log(data.player);
                console.log(user.id);
                setPlayers((prev) => prev.some(player => player.id == data.player.id) ? prev : [...prev, data.player]);
            },
            host_leave: (_) => {
                console.log('host leave called');
                leave();
            },
            check_user_authenticated: async (data) => {
                const playerId = data.player_id;
                const response = await API.get('check-user-authenticated', {'params': {'id': playerId}});
                console.log(response);
                setPlayers((prev) => prev.map(player => player.id == playerId ? {...player, isAuthenticated: response.data.status, ...response.data.spotify_details} : player))
                /// add another level for the spotify params so that they can easily be set to null when user logs out
            }
        });

        const setRoomAndUserDetails = async () => {
            try {
                const response = await API.get('get-room?code=' + roomCode);
                const data = response.data;
                setPlayers([data.user, ...data.players]);
                setGamestate(data.gamestate);
            } catch {
                leave();
            }
        }

        setRoomAndUserDetails();
        setIsLoading(false);
       
        return ()  => {
            socketManager.removeEvents(['gamestate_update', 'player_leave', 'player_add', 'host_leave'])
        }
    }, []);

    const user = players.length ? players[0] : {}
    if (user) {
        user.isWaiting = user.isReady && players.some(player => !player.isReady)
        if (!playerAddTriggered){
            socketManager.send('player_add', { player: user })
            setPlayerAddTriggered(true);
        }
    }
   
    return { roomCode, user, players, gamestate, isLoading }
};