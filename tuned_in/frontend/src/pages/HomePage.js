import React, { useEffect, useState } from "react";
import API from "../backend/API";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography, Box } from '@mui/material';
import SelectSongPage from "./SelectSongPage";
import  { Header, Footer, MainBox } from "../components/Layout";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import RoomJoinComponent from "../components/RoomJoinComponent";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";


export default function HomePage(props) {
  const [roomCode, setRoomCode] = useState(null);
  const [buttonPressed, setButtonPressed] = useState(undefined);

  useEffect(() => {
    API.get('user-in-room').then((response) => {
      setRoomCode(response.data.code)
    });
  }, []);

  const leaveRoomCallback = () => {
    setRoomCode(null);
    setButtonPressed(undefined);
  };

  const renderHomePage = () => {
    if (roomCode) {
      return <Navigate to={`/room/${roomCode}`} replace={true}/>
    } else {
      return (
      <MainBox>
        <Header>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h2" compact="h2"> 
                  Tuned In 
                </Typography>
              </Grid>
            </Grid>
        </Header>
        <div className="row outer">
          <div className="row inner">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box style={{width: "50%"}}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="h6">  
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
                  A party game powered by Spotify
                </Typography>
              </Grid>
              <Grid item>
                <img src="static/images/spotify-logo.png" height={50}/>
              </Grid>
            </Grid>
        </Footer>
      </MainBox>
      );
    };
  };

  const renderRoomPage = (props) => {
    return <Room {...props} leaveRoomCallback={leaveRoomCallback} />
  };
  
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={renderHomePage()} />
        <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
        <Route exact path="/embed" element={<EmbedSpotify />} />
        <Route path='room/:roomCode' element={renderRoomPage(props)} />
        <Route exact path="/select-song" element={<SelectSongPage />} />
      </Routes>
    </Router>
  );
}