import React, { useState, Fragment } from "react";
import { TogglableWithNavigateIcons } from "../shared/ToggableComponent";
import Avatar from "@mui/joy/Avatar";
import { Typography, Grid } from "@mui/material";



export default function AvatarToggler({ avatars, currentAvatarRef }){
    const [currIndex, setCurrIndex] = useState(0);

    currentAvatarRef.current = avatars[currIndex];

    console.log(currIndex, avatars.length - 1);

    return (
    <Fragment>
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <TogglableWithNavigateIcons 
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
                </TogglableWithNavigateIcons>
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
