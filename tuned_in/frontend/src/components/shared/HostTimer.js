import React, { useEffect, useState } from "react";
import { useSocketContext } from "../../providers/SocketContext";
import SocketProvider from "../../providers/SocketProvider";
import LinearProgress from "@mui/material/LinearProgress";
import { useUserContext } from "../../providers/UserContext";
import useUpdateGamestate from "../../hooks/useUpdateGamestate";


export default function HostTimer() {
    const [timer, setTimer] = useState(0);
    const socketManager = useSocketContext();
    const { user } = useUserContext();
    const updateGamestate = useUpdateGamestate();

    if (timer == 100 && user.isHost) updateGamestate();

    useEffect(() => {
        socketManager.onEvent('host_timer', (data) => {
            setTimer(data.timer);
        });
        if (user.isHost) socketManager.send('start_host_timer');
    }, []);

    return (
        <LinearProgress variant="determinate" value={timer} color="secondary"/>
    )
};


export function HostTimerTest(){
    return (
        <SocketProvider>
            <HostTimer />
        </SocketProvider>
    )
}