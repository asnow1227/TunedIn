import React, { Fragment, useState } from "react";
import API from "../../backend/API";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { withRouter } from "../../wrappers/withRouter";
import { authenticateUsersSpotify } from "../../backend/API";


function RoomJoinComponent(props){
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");

  const createRoom = async () => {
    await API.post('create-room', {alias: alias}).then((response) => {
      if (response.data.isAuthenticated){
        props.navigate(`/room/${response.data.roomCode}`);
      } else {
        props.navigate('/authenticate', { state: { roomCode: response.data.roomCode }});
        // pushing the state to the authenticate lets us know that we reached it from this component.
      }
    }).catch((error) => {
        setAliasError("Error creating room");
    }) 
  };

  const joinRoom = () => {
    API.post('join-room', {room_code: roomCode, alias: alias}).then((response) => {  
      if (response.data.isAuthenticated){
        props.navigate(`/room/${roomCode}`);
      } else {
        props.navigate('/authenticate', { state: { roomCode: roomCode }});
        // pushing the state to the authenticate lets us know that we reached it from this component.
      }
    }).catch((error) => {
        const data = error.response.data;
        setAliasError(data.type == 'alias' ? data.message : "");
        setRoomCodeError(data.type == 'room_code' ? data.message : "");
    })
  };

  const renderJoinField = () => {
    return (
      <Fragment>
          <Grid item xs={12} align="center">
              <TextField
                error={!!roomCodeError}
                placeholder="Enter a Room Code"
                helperText={roomCodeError}
                value={roomCode}
                variant="outlined"
                onChange={e => setRoomCode(e.target.value)}
              />
          </Grid>
      </Fragment>
    )};

  const title = props.join ? "Join a Room" : "Create a Room";

  return (
    <Grid container spacing={2} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          error={!!aliasError}
          placeholder="Enter an Alias"
          value={alias}
          helperText={aliasError}
          onChange={e => setAlias(e.target.value)}
        />
      </Grid>
      {props.join ? renderJoinField() : null}
      <Grid item xs={12}>
        <Button variant="contained" color="secondary" onClick={() => {props.join ? joinRoom() : createRoom()}}>
            {props.join ? "Join" : "Create"}
        </Button>
      </Grid>
    </Grid>
  )
};

export default withRouter(RoomJoinComponent);