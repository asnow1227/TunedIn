import React, { Component, useState } from "react";
import API from "../backend/API";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { withRouter } from "../wrappers/withRouter";


function RoomJoinOrCreatePage(props){
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");

  const createRoom = () => {
    API.post('create-room', {alias: alias}).then((response) => {
      props.navigate('/room/' + response.data.code)
    }).catch((error) => {
      console.log(error.response);
      setAliasError("Error creating room");
    }) 
  };

  const joinRoom = () => {
    API.post('join-room', {room_code: roomCode, alias: alias}).then((response) => {
      props.navigate('/room/' + roomCode);
    }).catch((error) => {
      const data = error.response.data;
      setAliasError(data.type == 'alias' ? data.message : "");
      setRoomCodeError(data.type == 'room_code' ? data.message : "");
      console.log(data);
    })
  };

  const renderJoinField = () => {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12} align="center">
          <TextField
            error={roomCodeError}
            label="Code"
            placeholder="Enter a Room Code"
            helperText={roomCodeError}
            value={roomCode}
            variant="outlined"
            onChange={e => setRoomCode(e.target.value)}
          />
        </Grid>
      </Grid>
    )};

    const title = props.join ? "Join a Room" : "Create a Room";
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
              error={aliasError}
              label="Alias"
              placeholder="Enter an Alias"
              value={alias}
              helperText={aliasError}
              variant="outlined"
              onChange={e => setAlias(e.target.value)}
            />
          </Grid>
          {props.join ? renderJoinField() : null}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={() => {props.join ? joinRoom() : createRoom()}}>
            {props.join ? "Join" : "Create"}
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
};

export default withRouter(RoomJoinOrCreatePage);
