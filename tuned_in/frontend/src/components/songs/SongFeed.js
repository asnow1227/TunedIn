import React, { Fragment } from "react";
import { Grid } from "@mui/material";
import SongCard from "./SongCard";
import SelectSongOptionsModal from "./SelectSongOptionsModal";

export default function SongFeed({ songs }){
    return (
    <Fragment>
        <Grid container spacing={1}>
            {songs.map((i, index) => (
                <Fragment key={index}>
                    <Grid item xs={12} md={6} lg={6}>
                    <SongCard
                    {...i} 
                    />
                    </Grid>
                </Fragment>
            ))}
        </Grid>
    </Fragment>
    )
}