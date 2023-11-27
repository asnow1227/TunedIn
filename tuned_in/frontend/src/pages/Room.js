import React, { Fragment, useState } from "react"; 
import QueuePage from "./QueuePage";
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/shared/Layout";
import RoomHeader from "../components/room/RoomHeader";
import useRoom from "../hooks/useRoom";
import UserContext from "../providers/UserContext";
import PlayersContext from "../providers/PlayersContext";
import Gamestate from "../components/room/Gamestate";
import ChooseAvatarModal from "../components/room/ChooseAvatarModal";
import GlobalSettingsContext from "../providers/GlobalSettingsProvider";
import UpdateSettingsModal from "../components/settings/UpdateSettingsModal";
import GamestateContext from "../providers/GameStateContext";


const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
}

export default function Room(props) {
    const { roomCode, user, players, setUserAndPlayers, gamestate, isLoading, settings, setSettings } = useRoom();
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const showRoom = () => {
        if (!user.avatarUrl){
            return <Fragment>
                <ChooseAvatarModal />
            </Fragment>
        };
        return (
            <MainBox>
                <RoomHeader avatarUrl={user.avatarUrl} />
                <Gamestate />
            </MainBox>
        )
    }
    
    return (
        <MainBox>
            <UserContext.Provider value={{ user, setUserAndPlayers }}>
                <PlayersContext.Provider value={players}>
                    <GamestateContext.Provider value={gamestate}>
                        <GlobalSettingsContext.Provider value={{ settings, setSettings, settingsOpen, setSettingsOpen }}>
                            { user.alias && showRoom() }
                        </GlobalSettingsContext.Provider>
                    </GamestateContext.Provider>
                </PlayersContext.Provider>
            </UserContext.Provider>
        </MainBox>
    )
}
