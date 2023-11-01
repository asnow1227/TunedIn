import React, { useState,  useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";  
import { Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import API, { SPOTIFY_API, authenticateUsersSpotify } from "../backend/API"
// import SocketManager from "../backend/SocketManager";
import useObjectState from "../hooks/useObjectState";
import QueuePage from "./QueuePage";
import AVATARS from "../components/Avatars";
import { BASE_URL } from "../backend/API";
import CreatePromptsPage from "./EnterPromptsPage";
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/Layout";
import RoomHeader from "../components/RoomHeader";
import { useHomePageContext } from "../contexts/HomePageContext";
import { useSocketContext } from "../contexts/SocketContext";
import useRoom from "../hooks/useRoom";
import UserContext from "../contexts/UserContext";
import PlayersContext from "../contexts/PlayersContext";


const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
}

const randomAvatar = () => {
    const imageUrl = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    return `${BASE_URL}${imageUrl}`
};

const checkUserWaiting = (players) => {
    const filtered = Object.keys(players)
    .filter(key => key!=user.user_id)
    .reduce((obj, key) => {
        obj[key] = players[key];
        return obj;
    }, {});

    return user.is_ready && filtered.some()

}

export default function Room(props) {
    const { roomCode, user, players, gamestate, isLoading } = useRoom();
    // const { roomCode } = useParams();
    // const [user, setUser] = useObjectState({isHost: null, isWaiting: null, isReady: false, alias: ""});
    // const [players, setPlayers] = useState(new Array());
    // const [gamestate, setGamestate] = useState(null);
    // const [playerAddTriggered, setPlayerAddTriggered] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(randomAvatar());
    const navigate = useNavigate();
    const socketManager = useSocketContext();
    
    //## calculate the isWaiting and user here and pass them as the user context (add the isWaiting to the user and set user to players[0])

    // const leaveRoomCallback = useHomePageContext();
    // const SocketManager = useSocketContext();
    
    // const leave = () => {
    //     console.log('Leave Room Called within Room')
    //     leaveRoomCallback();
    //     navigate('/');
    // }

    // const addPlayer = (newPlayer) => {
    //     setPlayers((prev) => prev.some(player => player.id == newPlayer.id) ? prev : [...prev, newPlayer]);
    // };

    // useEffect(() => {
        // SocketManager.initialize(roomCode);
        // SocketManager.onEvents({
        //     gamestate_update: (data) => {
        //         setGamestate(data.gamestate);
        //         setUser({isWaiting: false, isReady: false});
        //     },
        //     player_leave: (data) => {
        //         leave();
                // if (data.alias == user.alias){
                //     leave();
                // } else {
                //     setPlayers(prev => (prev.filter(alias => alias != data.alias)));
                // }
        //     },
        //     player_add: (data) => {
        //         addPlayer(data.player);
        //     },
        //     host_leave: (_) => {
        //         leave();
        //     },
        // });

        // const setRoomAndUserDetails = async () => {
        //     try {
        //         const response = await API.get('get-room?code=' + roomCode);
        //         const data = response.data;
        //         setPlayers([data.user, ...data.players]);
        //         setGamestate(data.gamestate);
        //         setUser({isWaiting: data.user.is_ready && data.players.some(elem => !elem.is_ready), ...data.user});
        //         return data.user.isHost;
        //     } catch {
        //         leave();
        //     }
        // }

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

    //     setIsLoading(true);
    //     setRoomAndUserDetails();
    //     setIsLoading(false);
       
    // }, []);

    // console.log(user.isHost);

    // if (user.alias && !playerAddTriggered){
    //     setPlayerAddTriggered(true);
    //     SocketManager.send('player_add', {player: user});
    // }

    // const setUserReady = async () => {
    //     try {
    //         const response = await API.post('ready-up');
    //         setUser({isReady: true, isWaiting: response.data.is_waiting});
    //         if (!response.data.is_waiting){
    //             const response = await API.post('next-gamestate');
    //             SocketManager.send('gamestate_update', {gamestate: response.data.gamestate});
    //         }
    //     } catch {
    //         alert("Error setting user to ready");
    //     }
    // };

    // const leaveButtonPressed = () => {
    //     if (user.isHost) {
    //         console.log('Host Leave Called from Within the Room Page');
    //         socketManager.send('host_leave', {room_code: roomCode});
    //     }
    //     else {
    //         socketManager.send('player_leave', {alias: user.alias});
    //     }
    // };

    const renderGameState = () => {
        if (user.isWaiting){;
            return <Typography variant="h4" component="h4">Waiting...</Typography>
        }
        const Component = gamestate ? PAGES[gamestate] : null;
        const props = {
            alias: user.alias, 
            isHost: user.isHost,
            // setUserReady: setUserReady,
            players: players,
            roomCode: roomCode,
            // leaveButtonPressed: leaveButtonPressed,
            avatarUrl: avatarUrl,
        }
        return Component ? <Component {...props}/> : null;
    }

    return (
        <MainBox>
            <UserContext.Provider value={user}>
                <PlayersContext.Provider value={players}>
                    <RoomHeader avatarUrl={avatarUrl} />
                    {!isLoading && renderGameState()}
                </PlayersContext.Provider>
            </UserContext.Provider>
        </MainBox>
    )
}
