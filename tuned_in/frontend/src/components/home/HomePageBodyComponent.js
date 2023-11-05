import React, { useState } from "react";
import { Grid, Button, ButtonGroup, Typography, Box } from '@mui/material';
import HomePageBody from "./HomePageBody";
import RoomJoinModal from "./RoomJoinModal";


export default function HomePageBodyComponent(){
    const [buttonPressed, setButtonPressed] = useState(undefined);
    return (
        <HomePageBody>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{width: {sm: "100%", md: "75%", lg:"50%"}}}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h4">  
                    How it Works
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" align="left">
                    4-8 players create prompts e.g., "Best song of the 2000s." Each prompt is assigned to two players, who choose a song they believe best
                    fits that prompt. The remaining players vote for the winner. The person
                    with the most votes at the end wins!
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <ButtonGroup disableElevation variant="contained" color="primary">
                <Button color="secondary" onClick={() => setButtonPressed('join')}>
                  Join a Room
                </Button>
                <Button color="secondary" onClick={() => setButtonPressed('create')}>
                  Create a Room
                </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <RoomJoinModal joinType={buttonPressed} onClose={() => setButtonPressed(undefined)} />
      </HomePageBody>
    )
}