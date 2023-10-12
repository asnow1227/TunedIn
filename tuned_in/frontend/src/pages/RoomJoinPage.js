import React, { useState } from "react";
import API from "../backend/API";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { withRouter } from "../wrappers/withRouter";
import { Centered } from "../components/Layout";


function RoomJoinOrCreatePage(props){
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");

  const createRoom = () => {
    API.post('create-room', {alias: alias}).then((response) => {
      props.navigate('/room/' + response.data.code)
    }).catch((error) => {
      setAliasError("Error creating room");
    }) 
  };

  const joinRoom = () => {
    API.post('join-room', {room_code: roomCode, alias: alias}).then((_) => {
      props.navigate('/room/' + roomCode);
    }).catch((error) => {
      const data = error.response.data;
      setAliasError(data.type == 'alias' ? data.message : "");
      setRoomCodeError(data.type == 'room_code' ? data.message : "");
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
      // <Centered>
        <Grid container spacing={1} align="center">
          <Grid item xs={12}>
            <Typography variant="h4" component="h4">
              {title}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={!!aliasError}
              label="Alias"
              placeholder="Enter an Alias"
              value={alias}
              helperText={aliasError}
              variant="standard"
              onChange={e => setAlias(e.target.value)}
              sx={{borderColor: "white"}}
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
    )
};

export default withRouter(RoomJoinOrCreatePage);
