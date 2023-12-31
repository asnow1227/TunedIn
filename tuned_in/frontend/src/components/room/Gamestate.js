import React, { Fragment } from "react";
import { useUserContext } from "../../providers/UserContext";
import { useGamestateContext } from "../../providers/GameStateContext";
import useUpdateGamestate from "../../hooks/useUpdateGamestate";
import { Typography } from "@mui/material";
import QueuePage from "../../pages/QueuePage";
import SelectSongPage from "../../pages/SelectSongPage";
import VotingPage from "../../pages/VotingPage";

const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
    'V': VotingPage
}

export default function Gamestate(){
    const { user } = useUserContext();
    const { gamestate } = useGamestateContext();

    if (user.isWaiting) return <Typography variant="h4" component="h4">{gamestate}</Typography>;
    const Component = PAGES[gamestate] || Fragment;
    return <Component />;
};