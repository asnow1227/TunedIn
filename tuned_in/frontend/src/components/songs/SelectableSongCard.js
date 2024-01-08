import React from "react";
import { useSongSelectionContext } from "../../contexts/SelectedSongContext";
import SongCard from "./SongCard";


export default function SelectableSongCard({ song }){
    const { setSelectedSong } = useSongSelectionContext();

    const onClick = () => {
        setSelectedSong(song);
    }

    return (
        <SongCard onClick={onClick} { ...song }/>
    )

}