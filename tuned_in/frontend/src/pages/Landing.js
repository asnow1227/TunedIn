import React, { useState } from "react";
import { Grid, Button, ButtonGroup, Typography, Box } from '@mui/material';
import  { Footer, MainBox } from "../components/shared/Layout";
import HomePageBodyComponent from "../components/home/HomePageBodyComponent";
import useImage from "../hooks/useImage";
import RejoinGameModal from "../components/home/RejoinGameModal";

export default function LandingPage({ roomCode }) {
    return (
        <MainBox>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h2" compact="h2"> 
              Tuned In 
            </Typography>
          </Grid>
        </Grid>
        <HomePageBodyComponent />
        {roomCode && <RejoinGameModal roomCode={roomCode} />}
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