import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";

export default function SpotifyAuthRoute(){
    const navigate = useNavigate();
    const { roomCode } = useParams();

    useEffect(() => {
        navigate(`/room/${roomCode}`, { state: { fromHistory: true }});
    }, []);

    return <div />
};