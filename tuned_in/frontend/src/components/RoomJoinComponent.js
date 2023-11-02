import React, { Fragment, useState } from "react";
import API from "../backend/API";
import { TextField, Button, Grid, Typography, getAccordionSummaryUtilityClass } from "@mui/material";
import { withRouter } from "../wrappers/withRouter";
import { authenticateUsersSpotify } from "../backend/API";


function RoomJoinComponent(props){
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");
  // const [showLoginOption, setShowLoginOption] = useState(false);
  // const [hasJoinedSuccessfully, setHasJoinedSuccessfully] = useState(false);
  // console.log('hasJoinedSuccessfully' + `${hasJoinedSuccessfully}`)

  const createRoom = async () => {
    await API.post('create-room', {alias: alias}).then((response) => {
        props.navigate('/room/' + response.data.code);
        // setHasJoinedSuccessfully(true);
    }).catch((error) => {
        setAliasError("Error creating room");
    }) 
  };

  const joinRoom = () => {
    API.post('join-room', {room_code: roomCode, alias: alias}).then((_) => {  
        props.navigate('/room/' + roomCode);
        // setHasJoinedSuccessfully(true);
    }).catch((error) => {
        const data = error.response.data;
        setAliasError(data.type == 'alias' ? data.message : "");
        setRoomCodeError(data.type == 'room_code' ? data.message : "");
    })
  };

  const handleLoginOption = async () => {
    await authenticateUsersSpotify();
    props.navigate('/room/' + roomCode)
  }

  // const showLoginButton = () => {
  //   return (
  //     <Button 
  //       variant="outlined"
  //       onClick={() => {
  //         handleLoginOption();
  //       }}  
  //       sx={(theme) => ({
  //       backgroundColor: theme.palette.primary.alternative,
  //       color: "white",
  //       borderColor: theme.palette.primary.alternative,
  //       "&:hover": {
  //         backgroundColor: theme.palette.primary.alternative,
  //         opacity: .6,
  //         color: "white",
  //         borderColor: theme.palette.secondary.main,
  //       }
  //     })}>
  //       Continue with Spotify
  //   </Button>
  //   )
  // };

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
      // hasJoinedSuccessfully ? showLoginButton() : 
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