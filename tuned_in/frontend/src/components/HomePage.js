import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import CreatePromptsPage from "./EnterPromptsPage"
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Redirect,
} from "react-router-dom";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Routes>
          <Route exact path="/" element={<p>This is the home page</p>}></Route>
          <Route exact path="/join" element={<RoomJoinPage />} />
          <Route exact path="/create" element={<CreateRoomPage />} />
          <Route exact path="/create-prompts" element={<CreatePromptsPage />} />
        </Routes>
      </Router>
    );
  }
}