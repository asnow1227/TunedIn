import React, { Component, useEffect, useState, Fragment } from "react";
import RoomJoinOrCreatePage from "./RoomJoinPage";
import API from "../backend/API";
import SocketManager from "../backend/SocketManager";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import { useTheme } from "@material-ui/core/styles";
import { Grid, Button, ButtonGroup, Typography, Box } from '@material-ui/core';
import SelectSongPage from "./SelectSongPage";
import  { Header, Centered, Row, Footer, MainBox } from "../components/Layout";
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
  const [create, setCreate] = useState(true);
  const theme = useTheme();

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
      <MainBox>
        <Header>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h1" compact="h1"> 
                  Welcome to Tuned In 
                </Typography>
              </Grid>
              <Grid item xs={12} align="center">
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
              </Grid>
            </Grid>
        </Header>
        <div className="row outer">
          <div className="row inner">
            <ButtonGroup disableElevation variant="contained" color="primary">
                <Button color="secondary" to="/join" component={Link} style={{opacity: .6 && create}}>
                  Join a Room
                </Button>
                <Button color="secondary" to="/create" component={Link} style={{opacity: .6 && create}}>
                  Create a Room
                </Button>
            </ButtonGroup>
            <RoomJoinOrCreatePage join={false} />
          </div>
        </div>
        
          {/* <Box height={1} width={1}>
            <Grid container spacing={3} align="center"> */}
                  {/* <Grid item xs={12}>
                    <Typography variant="h1" compact="h1">
                      Welcome to Tuned In
                    </Typography>
                  </Grid> */}
                  {/* <Grid item xs={12}>
                    <ButtonGroup disableElevation variant="contained" color="primary">
                      <Button color="secondary" to="/join" component={Link}>
                        Join a Room
                      </Button>
                      <Button color="secondary" to="/create" component={Link}>
                        Create a Room
                      </Button>
                    </ButtonGroup>
                  </Grid>
              </Grid>
            </Box> */}
        {/* </Row> */}
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