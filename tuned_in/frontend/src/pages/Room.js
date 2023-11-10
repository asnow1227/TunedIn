import React, { useState, Fragment } from "react"; 
import { Typography } from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import QueuePage from "./QueuePage";
import AVATARS from "../components/shared/Avatars";
import { BASE_URL } from "../backend/API";
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/shared/Layout";
import RoomHeader from "../components/room/RoomHeader";
import useRoom from "../hooks/useRoom";
import UserContext from "../providers/UserContext";
import PlayersContext from "../providers/PlayersContext";
import RoomContext from "../providers/RoomContext";
import GameState from "../components/room/Gamestate";


const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
}

const randomAvatar = () => {
    const imageUrl = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    return `${BASE_URL}${imageUrl}`
};

export default function Room(props) {
    const { roomCode, user, players, gamestate, isLoading } = useRoom();
    const [avatarUrl, setAvatarUrl] = useState(randomAvatar());
    
    return (
        <MainBox>
            <UserContext.Provider value={user}>
                <PlayersContext.Provider value={players}>
                    <RoomContext.Provider value={gamestate}>
                        <RoomHeader avatarUrl={avatarUrl} />
                        {!isLoading && <GameState />}
                    </RoomContext.Provider>
                </PlayersContext.Provider>
            </UserContext.Provider>
        </MainBox>
    )
}
