import React, { createContext, useContext } from "react";

const RoomContext = createContext({});
const SettingsContext = createContext({});

const useRoomContext = () => {
    return useContext(RoomContext);
}

const useSettingsContext = () => {
    return useContext(SettingsContext);
}