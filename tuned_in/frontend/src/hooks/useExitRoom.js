import React from "react";
import { useNavigate } from "react-router-dom";
import { useHomePageContext } from "../contexts/HomePageContext";

export default function useExitRoom(){
    const leaveRoomCallback = useHomePageContext();
    const navigate = useNavigate();
    return () => {
        leaveRoomCallback();
        navigate('/');
    }
}
