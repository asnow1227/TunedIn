import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { useSocketContext } from "../providers/SocketContext";
import useUpdateGamestate from "./useUpdateGamestate";
import useExitRoom from "./useExitRoom";
import API from "../backend/API";

const spotifyProps = {
    'image_url': null,
    'display_name': null,
    'spotify_id': null
}

export default function useRoom() {
    const { roomCode } = useParams();
    const [players, setPlayers] = useState(new Array());
    const [user, setUser] = useState({});
    const [gamestate, setGamestate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playerAddTriggered, setPlayerAddTriggered] = useState(false);
    const [settings, setSettings] = useState({});
    const socketManager = useSocketContext();
    const exitRoom = useExitRoom();
    const updateGamestate = useUpdateGamestate();
   
    if (!(players.some(player => !player.isReady)) && user.isHost && !isLoading){
        console.log('Gamestate update was triggered by comparison');
        /// this line will naturally update the gamestate if the host finishes required tasks on a page when all users are ready
        updateGamestate(user.isHost);
    }

    useEffect(() => {
        socketManager.onEvents({
            gamestate_update: (data) => {
                console.log('Gamestate update was triggered by socket');
                setGamestate(data.gamestate);
                setUser(prev => ({...prev, isWaiting: false, isReady: false}));
                setPlayers(prev => prev.map(player => ({...player, isReady: false})));
                console.log('Gamestate Update Called');
            },
            host_leave: (_) => {
                exitRoom();
            },
            settings_update: (data) => {
                setSettings(data);
            },
        });

        const setRoomAndUserDetails = async () => {
            try {
                const response = await API.get('get-room?code=' + roomCode);
                const data = response.data;
                setPlayers([data.user, ...data.players]);
                setUser({...data.user});
                setGamestate(data.gamestate);
                setSettings(data.settings);
            } catch {
                exitRoom();
            }
        }

        setRoomAndUserDetails();
        setIsLoading(false);
       
        return ()  => {
            socketManager.removeEvents(['gamestate_update', 'host_leave', 'settings_update'])
        }
    }, []);


    useEffect(() => {
        ///defining these in a separate useeffect to ensure we can access the most recent copies of each state we need
        if (!players.length) return;
        
        socketManager.onEvent('player_add', (data) => {
            console.log('player_add_triggered')
            if (!data.player.id) return;
            const player = players.find(player => player.id == data.player.id);
            if (!player) setPlayers([...players, data.player]);
            if (player.id == user.id && player.isAuthenticated != user.isAuthenticated) setUser({...player});
        });

        socketManager.onEvent('user_logout_spotify', async (data) => {
            if (!data.player_id) return;
            const player = players.find(player => player.id == data.player_id);
            if (!player) return; 
            setPlayers(prev => prev.map(player => (player.id == data.player_id ? {...player, isAuthenticated: false, ...spotifyProps} : {...player})));
            if (player.id == user.id) setUser({...user, isAuthenticated: false, ...spotifyProps});
        });

        socketManager.onEvent('player_leave', async (data) => {
            if (data.id == user.id){
                exitRoom();
                return
            }
            setPlayers(prev => prev.filter(player => player.id != data.id));
            if (user.isHost) {
                API.post('player-leave', {id: data.id});
            }
        });

        socketManager.onEvent('player_update', async (data) => {
            console.log('player_update_called');
            setPlayers(prev => prev.map(player => (player.id == data.player_id ? {...player, ...data.updates} : {...player})));
            if (data.player_id == user.id) setUser(prev => ({...prev, ...data.updates}));
        });

        return () => {
            socketManager.removeEvents(['player_add', 'user_spotify_logout', 'player_leave', 'player_update']);
        };

    }, [players, user]);
    
    if (user.avatarUrl) {
        user.isWaiting = user.isReady && players.some(player => !player.isReady);
        if (!playerAddTriggered){
            socketManager.send('player_add', { player: user });
            setPlayerAddTriggered(true);
        }
    }

    const setUserAndPlayers = (newUser) => {
        setUser(newUser);
        setPlayers(prev => [newUser, ...prev.slice(1)]);
    }
   
    return { roomCode, user, players, setUserAndPlayers, gamestate, setGamestate, isLoading, settings, setSettings }
};