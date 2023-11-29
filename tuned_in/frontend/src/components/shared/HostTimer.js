import React, { useEffect, useState } from "react";
import { useSocketContext } from "../../providers/SocketContext";
import SocketProvider from "../../providers/SocketProvider";
import LinearProgress from "@mui/material/LinearProgress";


export default function HostTimer() {
    const [timer, setTimer] = useState(0);
    const socketManager = useSocketContext();

    useEffect(() => {
        console.log(timer);
        socketManager.onEvent('host_timer', (data) => {
            setTimer(data.timer);
        });
        socketManager.send('start_host_timer');
    }, []);

    console.log(timer);
    return (
        <LinearProgress variant="determinate" value={timer*10} color="secondary"/>
    )
};


export function HostTimerTest(){
    return (
        <SocketProvider>
            <HostTimer />
        </SocketProvider>
    )
}