import React from "react";
import { useSocketContext } from "../providers/SocketContext";
import { useParams } from "react-router-dom";
import { useUserContext } from "../providers/UserContext";

export default function useLeaveRoom(_roomCode=null){
    const socketManager = useSocketContext();
    const { user } = useUserContext();
    let { roomCode } = useParams();
    if (_roomCode) roomCode = _roomCode;

    const leaveRoom = () => {
        if (user.isHost) {
            socketManager.send('host_leave', {room_code: roomCode});
        }
        else {
            socketManager.send('player_leave', {id: user.id});
        }
    };

    return leaveRoom;
};