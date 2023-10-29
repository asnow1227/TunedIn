import React, { useEffect, useState } from "react";
import API, { BASE_URL, SPOTIFY_API} from "../backend/API";
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
import useImage from "../hooks/useImage";
import { authenticateUsersSpotify } from "../backend/API";
import HomePageHeader from "../components/HomePageHeader";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";


const fetchRoomCode = async () => {
  return API.get('user-in-room').then((response) => {
    // console.log(response.data);
    return response.data;
  }).catch((err) => {
    console.log(err); 
  });
}

const fetchUsersSpotify = async () => {
  return SPOTIFY_API.get('is-authenticated').then((response) => {
    return response.data;
  }).catch((err) => {
    console.log(err)
  });
}

const LogoutSpotify = async () => {
  return SPOTIFY_API.post('logout')
}

export default function HomePage(props) {
  const [roomCode, setRoomCode] = useState(null);
  const [buttonPressed, setButtonPressed] = useState(undefined);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [spotifyUserDetails, setSpotifyUserDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setUp = async () => {
      await fetchRoomCode().then((data) => {
        if (data.code){
          setRoomCode(data.code);
        }
      });
      await fetchUsersSpotify().then((data) => {
        console.log(data.status);
        console.log(data.spotify_user_details);
        setIsSpotifyAuthenticated(data.status);
        setSpotifyUserDetails(data.spotify_user_details);
      });
    }
    setUp();
    setIsLoading(false);
  }, []);

  const leaveRoomCallback = () => {
    setRoomCode(null);
    setButtonPressed(undefined);
    API.post('clear-room-session');
    // setIsSpotifyAuthenticated(false);
    // setSpotifyUserDetails({});
  };

  const handleSpotifyLogout = async () => {
    await LogoutSpotify().then((response) => {
      setIsSpotifyAuthenticated(false);
      setSpotifyUserDetails({});
    }).catch((err) => {
      console.log(err)
      alert("Error logging out of Spotify");
    })
  }

  const renderHomePage = () => {
    if (roomCode) {
      return <Navigate to={`/room/${roomCode}`} replace={true}/>
    } else {
      return (
      <MainBox>
        {isSpotifyAuthenticated && <HomePageHeader spotifyAvatarUrl={spotifyUserDetails.image_url} />}
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
              <Grid item xs={12}>
                <Button 
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
                </Button>
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
    };
  };

  const renderRoomPage = (props) => {
    return <Room {...props} leaveRoomCallback={leaveRoomCallback} isAuthenticated={isSpotifyAuthenticated}/>
  };
  
  return (
      <Router>
        <Routes>
          <Route exact path="/" element={!isLoading && renderHomePage()} />
          <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
          <Route exact path="/embed" element={<EmbedSpotify />} />
          <Route path='room/:roomCode' element={renderRoomPage(props)} />
          <Route exact path="/select-song" element={<SelectSongPage />} />
        </Routes>
      </Router>
  );
}