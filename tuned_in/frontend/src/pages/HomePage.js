import React, { useEffect, useState } from "react";
import API, { BASE_URL, SPOTIFY_API} from "../backend/API";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography, Box, getAccordionSummaryUtilityClass } from '@mui/material';
import SelectSongPage from "./SelectSongPage";
import getRoom from '../features/getRoom';
import  { Header, Footer, MainBox } from "../components/Layout";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import RoomJoinComponent from "../components/RoomJoinComponent";
import useImage from "../hooks/useImage";
import { authenticateUsersSpotify } from "../backend/API";
import HomePageHeader from "../components/HomePageHeader";
import LandingPage from "./Landing";
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
  // const [buttonPressed, setButtonPressed] = useState(undefined);
  // const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  // const [spotifyUserDetails, setSpotifyUserDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setUp = async () => {
      const roomCode = await fetchRoomCode();
      if (roomCode.code) {
        setRoomCode(roomData.code);
        const roomDetails = await getRoom(roomData.code);
        console.log('room Details called', roomDetails);
      }
      // const roomDetails = await getRoomDetails();
      
      // await fetchRoomCode().then((data) => {
      //   if (data.code){
      //     setRoomCode(data.code);
      //   }
      // });
      // await fetchUsersSpotify().then((data) => {
      //   console.log(data.status);
      //   console.log(data.spotify_user_details);
      //   setIsSpotifyAuthenticated(data.status);
      //   setSpotifyUserDetails(data.spotify_user_details);
      // });
    }
    setUp();
    setIsLoading(false);
  }, []);

  const leaveRoomCallback = () => {
    setRoomCode(null);
    // setButtonPressed(undefined);
    API.post('clear-room-session');
    console.log('calling leave callback');
    // setIsSpotifyAuthenticated(false);
    // setSpotifyUserDetails({});
  };

  // const handleSpotifyLogout = async () => {
  //   await LogoutSpotify().then((response) => {
  //     setIsSpotifyAuthenticated(false);
  //     setSpotifyUserDetails({});
  //   }).catch((err) => {
  //     console.log(err)
  //     alert("Error logging out of Spotify");
  //   })
  // }

  const renderHomePage = () => {
    if (roomCode) {
      return <Navigate to={`/room/${roomCode}`} replace={true}/>
    } else {
      return <LandingPage />
    };
  };

  const renderRoomPage = (props) => {
    return <Room {...props} leaveRoomCallback={leaveRoomCallback} />
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