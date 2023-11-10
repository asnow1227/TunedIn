import React, { Fragment } from "react";
import { useUserContext } from "../../providers/UserContext";
import { useRoomContext } from "../../providers/RoomContext";
import { Typography } from "@mui/material";
import QueuePage from "../../pages/QueuePage";
import SelectSongPage from "../../pages/SelectSongPage";
import { useLocation } from "react-router-dom";

const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
}

export default function GameState(){
    const user = useUserContext();
    const gamestate = useRoomContext();
    const location = useLocation();
    if (location.state && location.state.fromHistory){
        console.log('From History')
    }

    if (user.isWaiting) return <Typography variant="h4" component="h4">Waiting...</Typography>;
    const Component = PAGES[gamestate] || Fragment;
    return <Component />;
}