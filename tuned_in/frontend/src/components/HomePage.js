import React, { Component } from "react";
import RoomJoinOrCreatePage from "./RoomJoinPage";
import CreatePromptsPage from "./EnterPromptsPage";
import EmbedSpotify from "./SpotifyEmbed";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';
import SelectSongPage from "./selectSongPageFunctional";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Redirect,
  Navigate
} from "react-router-dom";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch('/api/user-in-room')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code
        });
      });
  }

  renderHomePage() {
    if (this.state.roomCode) {
      return <Navigate to={`/room/${this.state.roomCode}`} replace={true}/>
    } else {
      return (
        <div className="center">
        <Grid container spacing={3} align="center">
            <Grid item xs={12}>
              <Typography variant="h3" compact="h3">
                House Party
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
  }

  renderRoomPage(props) {
    return <Room {...props} leaveRoomCallback={this.clearRoomCode} />
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    })
  }

  render() {

    return (
      <Router>
        <Routes>
          <Route exact path="/" element={this.renderHomePage()} />
          <Route exact path="/join" element={<RoomJoinOrCreatePage join={true}/>} />
          <Route exact path="/create" element={<RoomJoinOrCreatePage join={false}/>} />
          <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
          <Route exact path="/embed" element={<EmbedSpotify />} />
          <Route path='room/:roomCode' element={this.renderRoomPage(this.props)} />
          <Route exact path="/select-song" element={<SelectSongPage />} />
        </Routes>
      </Router>
    );
  }
}