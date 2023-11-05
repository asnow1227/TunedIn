import React, { useState,  useEffect, useRef, useContext, Fragment } from "react";
import { useParams } from "react-router-dom";  
import { Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import API, { SPOTIFY_API, authenticateUsersSpotify } from "../backend/API"
// import SocketManager from "../backend/SocketManager";
import useObjectState from "../hooks/useObjectState";
import QueuePage from "./QueuePage";
import AVATARS from "../components/shared/Avatars";
import { BASE_URL } from "../backend/API";
import CreatePromptsPage from "./EnterPromptsPage";
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/shared/Layout";
import RoomHeader from "../components/room/RoomHeader";
import { useHomePageContext } from "../providers/HomePageContext";
import { useSocketContext } from "../providers/SocketContext";
import useRoom from "../hooks/useRoom";
import UserContext from "../providers/UserContext";
import PlayersContext from "../providers/PlayersContext";


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
    const navigate = useNavigate();

    const renderGameState = () => {
        if (user.isWaiting) return <Typography variant="h4" component="h4">Waiting...</Typography>;
        const Component = PAGES[gamestate] || Fragment;
        return <Component />;
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
