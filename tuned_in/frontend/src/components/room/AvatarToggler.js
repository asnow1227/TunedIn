import React, { useState, Fragment } from "react";
import ToggableComponent from "../shared/ToggableComponent";
import Avatar from "@mui/joy/Avatar";
import { Typography, Grid } from "@mui/material";
import useWindowDimensions from "../../hooks/useWindowSize";



export default function AvatarToggler({ avatars, currentAvatarRef }){
    const [currIndex, setCurrIndex] = useState(0);
    const { width, height } = useWindowDimensions();
    const avatarSize = Math.max(Math.floor(width/8), '30')

    currentAvatarRef.current = avatars[currIndex];

    return (
    <Fragment>
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <ToggableComponent 
                    onLeftIcon={() => setCurrIndex(currIndex - 1)} 
                    displayLeftIcon={currIndex != 0}
                    onRightIcon={() => setCurrIndex(currIndex + 1)}
                    displayRightIcon={currIndex != avatars.length-1}
                >
                <Avatar 
                    src={avatars[currIndex].avatarUrl}
                    sx={{
                        '--Avatar-size': {xs: '80px', sm: '100px', md: '150px', lg: '200px'}
                    }}
                />
                </ToggableComponent>
            </Grid>
            <Grid item xs={12} >
                <Typography >
                    {avatars[currIndex].avatarName}
                </Typography>
            </Grid>
        </Grid>
    </Fragment>
    )
   
}
