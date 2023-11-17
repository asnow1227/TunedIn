import React, { useState, useEffect, Fragment } from "react"; 
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
import useImage from "../hooks/useImage";
import ChooseAvatarModal from "../components/room/ChooseAvatarModal";


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
    const { roomCode, user, players, setUserAndPlayers, gamestate, isLoading } = useRoom();
    
    const showRoom = () => {
        if (!user.avatarUrl){
            return <Fragment>
                <ChooseAvatarModal />
            </Fragment>
        }
        return (
            <Fragment>
                 <RoomHeader avatarUrl={user.avatarUrl} />
                 <GameState />
            </Fragment>
        )
    }
    console.log('room rerendering');
    
    return (
        <MainBox>
            <UserContext.Provider value={{ user, setUserAndPlayers }}>
                <PlayersContext.Provider value={players}>
                    <RoomContext.Provider value={gamestate}>
                        {user.alias && showRoom() }
                    </RoomContext.Provider>
                </PlayersContext.Provider>
            </UserContext.Provider>
        </MainBox>
    )
}
