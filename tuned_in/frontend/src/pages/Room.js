import React, { Fragment, useState } from "react"; 
import QueuePage from "./QueuePage";
import SelectSongPage from "./SelectSongPage"
import { MainBox } from "../components/shared/Layout";
import useRoom from "../hooks/useRoom";
import UserContext from "../contexts/UserContext";
import PlayersContext from "../contexts/PlayersContext";
import Gamestate from "../components/room/Gamestate";
import ChooseAvatarModal from "../components/room/ChooseAvatarModal";
import GlobalSettingsContext from "../contexts/GlobalSettingsProvider";
import UpdateSettingsModal from "../components/settings/UpdateSettingsModal";
import GamestateContext from "../contexts/GameStateContext";
import RoomHeader from "../components/room/RoomHeader";


const PAGES = {
    'Q': QueuePage,
    'P': QueuePage,
    'SEL': SelectSongPage,
}

export default function Room(props) {
    const { roomCode, user, players, setUserAndPlayers, gamestate, setGamestate, isLoading, settings, setSettings } = useRoom();
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const showRoom = () => {
        if (!user.avatarUrl){
            return <Fragment>
                <ChooseAvatarModal />
            </Fragment>
        };
        if (settings.hostDeviceOnly === null){
            return <Fragment>
                <UpdateSettingsModal isOpen={true} />
            </Fragment>
        }
        return (
            <MainBox>
                {/* <RoomHeader /> */}
                <Gamestate />
            </MainBox>
        )
    }
    
    return (
        <UserContext.Provider value={{ user, setUserAndPlayers }}>
            <PlayersContext.Provider value={players}>
                <GamestateContext.Provider value={{ gamestate, setGamestate }}>
                    <GlobalSettingsContext.Provider value={{ settings, setSettings, settingsOpen, setSettingsOpen }}>
                        { user.alias && showRoom() }
                    </GlobalSettingsContext.Provider>
                </GamestateContext.Provider>
            </PlayersContext.Provider>
        </UserContext.Provider>
    )
}
