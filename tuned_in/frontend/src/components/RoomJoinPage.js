import React, { Component } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { withRouter } from "./withRouter";

class RoomJoinOrCreatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      roomCodeError: "",
      aliasError: "",
      alias: ""
    };
    this.handleCodeTextFieldChange = this.handleCodeTextFieldChange.bind(this);
    this.roomButtonPressed = this.roomButtonPressed.bind(this);
    this.handleAliasTextFieldChange = this.handleAliasTextFieldChange.bind(this);
    this.renderJoinField = this.renderJoinField.bind(this);
    this.handleJoinRoom = this.handleJoinRoom.bind(this);
    this.handleCreateRoom = this.handleCreateRoom.bind(this);
  }

  handleCodeTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value,
    })
  }

  handleAliasTextFieldChange(e) {
    this.setState({
      alias: e.target.value,
    })
  }

  renderJoinField(){
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12} align="center">
          <TextField
            error={this.state.roomCodeError}
            label="Code"
            placeholder="Enter a Room Code"
            helperText={this.state.roomCodeError}
            value={this.state.roomCode}
            variant="outlined"
            onChange={this.handleCodeTextFieldChange}
          />
        </Grid>
      </Grid>
    )

  }

  handleCreateRoom() {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias: this.state.alias
      }),
    };
    fetch('/api/create-room', requestOptions)
      .then((response) => {
        if (response.ok){
          return response.json()
        } 
        this.setState({
          aliasError: "Error Creating Room"
        })
      })
      .then((data) => this.props.navigate('/room/' + data.code))
      .catch((error) => console.log(error));
  }

  handleJoinRoom() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({
        room_code: this.state.roomCode,
        alias: this.state.alias,
      })
    };
    fetch('api/join-room', requestOptions).then((response) => {
      if (response.ok) {
        this.props.navigate(`/room/${this.state.roomCode}`)
      } else {
        return response.json()
      }
    }).then((data) => {
      console.log(data);
      const message = data.message;
      if (data.type == "room_code"){
        this.setState({
          roomCodeError: message,
          aliasError: ""
        })
      } else {
        this.setState({
          roomCodeError: "",
          aliasError: message
        })
      }
    })
    .catch((error) => {
      console.log(String(error));
    });
  }

  roomButtonPressed() {
    this.props.join ? this.handleJoinRoom() : this.handleCreateRoom()
  }

  render() {
    const title = this.props.join ? "Join a Room" : "Create a Room";
    return (
      <div className="center">
        <Grid container spacing={1} align="center">
          <Grid item xs={12}>
            <Typography variant="h4" component="h4">
              {title}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={this.state.aliasError}
              label="Alias"
              placeholder="Enter an Alias"
              value={this.state.alias}
              helperText={this.state.aliasError}
              variant="outlined"
              onChange={this.handleAliasTextFieldChange}
            />
          </Grid>
          {this.props.join ? this.renderJoinField() : null}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={this.roomButtonPressed}>
            {this.props.join ? "Join" : "Create"}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" to="/" component={Link}>
              Back
            </Button>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withRouter(RoomJoinOrCreatePage);