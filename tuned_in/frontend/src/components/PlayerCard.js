import React from "react";
import { Grid } from "@mui/material";
import { Card, CardContent, Typography, AspectRatio, Button, CardCover } from "@mui/joy";
import { BASE_URL } from "../backend/API";

const getBg = (theme) => {
    return `repeating-linear-gradient(45deg, rgba(${theme.vars.palette.secondary.lightChannel}), rgba(${theme.vars.palette.primary.lightChannel}) 40px, rgba(${theme.vars.palette.primary.lightChannel}), rgba(${theme.vars.palette.primary.lightChannel}) 80px)`
}

export default function PlayerCard(props){
    return (
    <Grid item xs={12}>
        <Card
            height={125}
            orientation="horizontal"
            variant="outlined"
            sx={(theme) => ({
                background: getBg(theme), 
                backgroundColor: `${theme.vars.palette.primary.solidBg}`, borderColor: `${theme.vars.palette.secondary.solidBg}`, color: "white"
            })}
        >
            <CardCover>
                <img src={BASE_URL + 'static/spotify-logo.png'} loading="lazy" alt=""/>
            </CardCover>
            <AspectRatio ratio="1" sx={(theme) => ({ width: 100, borderColor: `white` })}>
                <img src={BASE_URL + props.image_url} alt=""/>
            </AspectRatio>
            <CardContent>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <Typography level="h2" textColor="white">
                            {props.alias}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography color="textSecondary" level="body-sm">
                            {"Score: " + props.score}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="solid" color="secondary" sx={{maxWidth: '100px', maxHeight: '20px', minWidth: '100px', minHeight: '20px', fontSize: "10px"}}>
                            Follow
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    </Grid>
    )
}