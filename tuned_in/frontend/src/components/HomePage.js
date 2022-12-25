import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import CreatePromptsPage from "./EnterPromptsPage"
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';
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
          <Route exact path="/join" element={<RoomJoinPage />} />
          <Route exact path="/create" element={<CreateRoomPage />} />
          <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
          <Route path='room/:roomCode' element={this.renderRoomPage(this.props)} />
        </Routes>
      </Router>
    );
  }
}