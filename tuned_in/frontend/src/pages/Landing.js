import React, { useState } from "react";
import { Grid, Button, ButtonGroup, Typography, Box } from '@mui/material';
import  { Footer, MainBox } from "../components/Layout";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import RoomJoinComponent from "../components/RoomJoinComponent";
import useImage from "../hooks/useImage";

export default function LandingPage() {
    const [buttonPressed, setButtonPressed] = useState(undefined);
    return (
        <MainBox>
        {/* {isSpotifyAuthenticated && <HomePageHeader spotifyAvatarUrl={spotifyUserDetails.image_url} />} */}
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h2" compact="h2"> 
              Tuned In 
            </Typography>
          </Grid>
        </Grid>
        <div className="row outer">
          <div className="row inner">
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
              {/* <Grid item xs={12}> */}
                {/* <Button 
                  variant="outlined"
                  onClick={() => {
                    isSpotifyAuthenticated ? handleSpotifyLogout() : authenticateUsersSpotify();
                  }}  
                  sx={(theme) => ({
                  backgroundColor: theme.palette.primary.alternative,
                  color: "white",
                  borderColor: theme.palette.primary.alternative,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.alternative,
                    opacity: .6,
                    color: "white",
                    borderColor: theme.palette.secondary.main,
                  }
                })}>
                  {isSpotifyAuthenticated ? "Logout of Spotify" : "Login with Spotify"}
                </Button> */}
              {/* </Grid> */}
            </Grid>
            <Modal
             open={!!buttonPressed}
             onClose={() => setButtonPressed(undefined)}
             color="primary"
            >
              <ModalDialog variant='solid' color="primary">
                <ModalClose />
                <RoomJoinComponent join={buttonPressed == 'join' ? true : false} />
              </ModalDialog>
            </Modal>
          </div>
        </div>
        <Footer>
            <Grid container wrap="nowrap" direction="row" alignItems="center" justifyContent="center">
              <Grid item>
                <Typography variant="h4">  
                  Powered by Spotify
                </Typography>
              </Grid>
              <Grid item>
                <img src={useImage('logo', 'spotify-logo')} height="30rem"/>
              </Grid>
            </Grid>
        </Footer>
      </MainBox>
    );
}