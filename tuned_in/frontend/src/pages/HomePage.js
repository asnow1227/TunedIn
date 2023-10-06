import React, { Component, useEffect, useState, Fragment } from "react";
import RoomJoinOrCreatePage from "./RoomJoinPage";
import API from "../backend/API";
import SocketManager from "../backend/SocketManager";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';
import SelectSongPage from "./SelectSongPage";
import BoxComponent from "./Box";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Redirect,
  Navigate
} from "react-router-dom";


export default function HomePage(props) {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    API.get('user-in-room').then((response) => {
      setRoomCode(response.data.code)
    });
  }, []);

  const leaveRoomCallback = () => {
    setRoomCode(null);
  };

  const renderHomePage = () => {
    if (roomCode) {
      return <Navigate to={`/room/${roomCode}`} replace={true}/>
    } else {
      return (
        <div className="center">
          <Grid container spacing={3} align="center">
              <Grid item xs={12}>
                <Typography variant="h3" compact="h3">
                  Tuned In
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <ButtonGroup disableElevation variant="contained" color="primary">
                  <Button color="primary" to="/join" component={Link}>
                    Join a Room
                  </Button>
                  <Button color="secondary" to="/create" component={Link}>
                    Create a Room
                  </Button>
                </ButtonGroup>
              </Grid>
          </Grid>
        </div>
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
        <Route exact path="/box" element={<BoxComponent />} />
        <Route exact path="/join" element={<RoomJoinOrCreatePage join={true}/>} />
        <Route exact path="/create" element={<RoomJoinOrCreatePage join={false}/>} />
        <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
        <Route exact path="/embed" element={<EmbedSpotify />} />
        <Route path='room/:roomCode' element={renderRoomPage(props)} />
        <Route exact path="/select-song" element={<SelectSongPage />} />
      </Routes>
    </Router>
  );
}