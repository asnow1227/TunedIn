import React, { Component } from "react";
import { Button, Grid, Typography, FormHelperText, TextField, FormControl, Radio, RadioGroup, FormControlLabel } from "@material-ui/core";
import { Link } from "react-router-dom";
import {withRouter} from './withRouter';
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/alert";

class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallback: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      errorMsg: "",
      successMsg: "",
    };
    this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    this.renderCreateButtons = this.renderCreateButtons.bind(this);
    this.renderUpdateButtons = this.renderUpdateButtons.bind(this);
    this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
    this.clearErrorMsg = this.clearErrorMsg.bind(this);
    this.clearSuccessMsg = this.clearSuccessMsg.bind(this);
  }

  handleVotesChange(e) {
    this.setState({
      votesToSkip: e.target.value,
    });
  }

  handleGuestCanPauseChange(e) {
    this.setState({
      guestCanPause: e.target.value === 'true'? true: false,
    });
  }

  handleRoomButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
      }),
    };
    fetch('/api/create-room', requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.navigate('/room/' + data.code));
  }

  handleUpdateButtonPressed() {
    const requestOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.props.roomCode,
      }),
    };
    fetch('/api/update-room', requestOptions)
      .then((response) => {
        if (response.ok) {
          this.setState({
            successMsg: "Room Updated Successfully!"
          });
        } else {
          this.setState({
            errorMsg: "Error Updating Room"
          });
        }
      })
      .then((data) => this.props.navigate('/room/' + data.code));
  }

  renderCreateButtons() {
    return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Button color="primary" variant="contained" onClick={this.handleRoomButtonPressed}> 
          Create a Room 
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" to="/" component={Link}> 
          Back
        </Button>
      </Grid>
    </Grid>
    )
  }

  renderUpdateButtons() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button color="primary" variant="contained" onClick={this.handleUpdateButtonPressed}> 
            Update a Room 
          </Button>
        </Grid>
      </Grid>
    )
  }

  clearErrorMsg() {
    this.setState({
      errorMsg: "",
    })
  }

  clearSuccessMsg () {
    this.setState({
      successMsg: "",
    })
  }

  render() {
    const title = this.props.update ? "Update Room": "Create a Room"
    return (
      <div className="center">
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
            {this.state.successMsg != "" ? 
              (<Alert 
                severity="success" 
                onClose = {this.clearSuccessMsg}>
              {this.state.successMsg}
              </Alert>) :
              (<Alert 
                severity="error" 
                onClose ={this.clearErrorMsg}>
              {this.state.errorMsg}
            </Alert>)
            }
          </Collapse>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography component='h4' variant='h4'>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText>
              <div align="center">
                Guest Control of Playback State
              </div>
            </FormHelperText>
            <RadioGroup row 
              defaultValue={String(this.props.guestCanPause)} 
              onChange={this.handleGuestCanPauseChange}>
              <FormControlLabel 
              value="true" 
              control={<Radio color="primary" />}
              label = "Play/Pause"
              labelPlacement="bottom">
              </FormControlLabel>
              <FormControlLabel 
              value="false" 
              control={<Radio color="secondary" />}
              label = "No Control"
              labelPlacement="bottom">
              </FormControlLabel>
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl>
            <TextField 
              required={true} 
              type="number" 
              onChange={this.handleVotesChange} 
              defaultValue={this.state.votesToSkip} 
              inputProps={{ min:1, style: { textAlign: "center" },
            }}/>
            <FormHelperText>
              <div align="center">
                Votes Required to Skip Song
              </div>
            </FormHelperText>
          </FormControl>
        </Grid>
        {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
      </Grid>
      </div>
    );
  }
}

export default withRouter(CreateRoomPage);