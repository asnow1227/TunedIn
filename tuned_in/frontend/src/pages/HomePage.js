import React, { useEffect, useState } from "react";
import API from "../backend/API";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import SelectSongPage from "./SelectSongPage";
import LandingPage from "./Landing";
import HomePageContext from "../providers/HomePageContext";
import SocketProvider from "../providers/SocketProvider";
import UserContext from "../providers/UserContext";
import PromptSpotifyLogin from "../components/room/PromptSpotifyLogin";
import { HostTimerTest } from "../components/shared/HostTimer";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";


const fetchRoomCode = async () => {
  return API.get('user-in-room').then((response) => {
    return response.data;
  }).catch((err) => {
    console.log(err); 
  });
};

export default function HomePage(props) {
  const [room, setRoom] = useState({code: null, isHost: null, id: null});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setUp = async () => {
      const roomCode = await fetchRoomCode().then((data) => {
        if (data.code) setRoom(data);
      });
    };
    setUp();
    setIsLoading(false);
  }, []);

  const leaveRoomCallback = () => {
    setRoom({});
    API.post('clear-room-session');
    console.log('calling leave callback');
  };

  const renderHomePage = () => {
    if (room.code) {
      console.log(room.code);
      return (
        <SocketProvider code={room.code}>
          <HomePageContext.Provider value={leaveRoomCallback}>
            <UserContext.Provider value={{ isHost: room.isHost, id: room.id }}>
              <LandingPage roomCode={room.code}/>
            </UserContext.Provider>
          </HomePageContext.Provider>
        </SocketProvider>
      )
    } else {
      return <LandingPage />
    };
  };

  const renderRoomPage = (props) => {
    return (
      <HomePageContext.Provider value={leaveRoomCallback}>
        <SocketProvider>
          <Room {...props} />
        </SocketProvider>
      </HomePageContext.Provider>
    )
  };
  
  return (
      <Router>
        <Routes>
          <Route exact path="/" element={!isLoading && renderHomePage()} />
          <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
          <Route exact path="/embed" element={<EmbedSpotify />} />
          <Route path='room/:roomCode' element={renderRoomPage(props)} />
          <Route path='room/:roomCode/host-timer' element={<HostTimerTest />} />
          <Route path='/authenticate' element={<PromptSpotifyLogin />} />
          <Route exact path="/select-song" element={<SelectSongPage leaveButtonPressed={leaveRoomCallback}/>} />
        </Routes>
      </Router>
  );
}