import React, { Fragment } from "react";
import { Grid } from "@mui/material";
import PlayerCard from "./PlayerCard";

export default function PlayerFeed({ players }) {
    console.log('player feed rerendered');
    return (
        <Grid container spacing={1}>
            {players.map((player, i) => {
                return (
                    <Fragment key={i}>
                        <Grid item xs={12} md={6} lg={6}>
                            <PlayerCard alias={player.alias} avatarUrl={player.avatarUrl} score={0}/>
                        </Grid>
                    </Fragment>
                )
            })}
        </Grid>
    )
   
}