import React, { Fragment } from "react";
import { Grid } from "@mui/material";
import MusicCard from "./MusicCard";

export default function SongFeed({ songs }){
    const [selectedProps, setSelectedProps] = useState({});
    const setSelectedCallback = (selectedProps) => {
        setSelectedProps(selectedProps);
    };
    
    return (
        <Grid container spacing={1}>
            {songs.map((i, index) => (
                <Fragment key={i}>
                    <Grid item xs={12} md={6} lg={6}>
                    <MusicCard 
                    {...i} 
                    key={index} 
                    setSelectedCallback={setSelectedCallback} 
                    selectedId={selectedProps.id}/>
                    </Grid>
                </Fragment> 
            ))}
        </Grid>
    )
}