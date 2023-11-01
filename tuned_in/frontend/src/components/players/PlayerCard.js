import React from "react";
import { Grid } from "@mui/material";
import { Card, CardContent, Typography, Button, CardCover } from "@mui/joy";
import useImage from "../../hooks/useImage";
import Avatar from "@mui/joy/Avatar";
import useWindowDimensions from "../../hooks/useWindowSize";

export default function PlayerCard(props){
    const { height } = useWindowDimensions();
    const cardHeight = Math.floor(height/5);
    console.log(`Card Height: ${cardHeight}`)
    const avatarSize = Math.floor(4*cardHeight/5);
    return (
    <Card
    height={cardHeight}
    orientation="horizontal"
    variant="outlined"
    sx={(theme) => ({
        background: `${theme.vars.palette.secondary.solidBg}`, 
        backgroundColor: `${theme.vars.palette.primary.solidBg}`, borderColor: `${theme.vars.palette.secondary.solidBg}`, color: "white"
    })}
    >
        <CardCover>
            <img src={useImage('background', 'blurry-gradient-haikei')} loading="lazy" alt=""/>
        </CardCover>
        <Avatar src={props.avatarUrl} sx={{'--Avatar-size': `${avatarSize}px`}} />
        <CardContent>
            <Grid container spacing={0} alignItems="center">
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
    )
}