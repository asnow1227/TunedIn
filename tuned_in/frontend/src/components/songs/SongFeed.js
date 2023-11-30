import React, { Fragment } from "react";
import { Grid } from "@mui/material";
import MusicCard from "./MusicCard";
import SongOptionsModal from "./SongOptionsModal";

export default function SongFeed({ songs }){

    return (
    <Fragment>
        <SongOptionsModal />
        <Grid container spacing={1}>
            {songs.map((i, index) => (
                <Fragment key={index}>
                    <Grid item xs={12} md={6} lg={6}>
                    <MusicCard 
                    {...i} 
                    />
                    </Grid>
                </Fragment>
            ))}
        </Grid>
    </Fragment>
    )
}