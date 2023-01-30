import React, { Component } from 'react';
import { Grid, Typography, Card, IconButton, LinearProgress, Icon } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";


export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
        this.getCurrentSong = this.getCurrentSong.bind(this)
        this.state = {
            song: {},
            intervalId: null,
        }
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        const intervalId = setInterval(this.getCurrentSong, 500);
        this.setState({
            intervalId: intervalId,
        })
    }
  
    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    getCurrentSong = () => {
        fetch('/spotify/current-song').then((response) => {
            if (!response.ok){
                return {};
            } else {
                return response.json();
            }
        }).then((data) => this.setState({
            song: data,
        }))
    };

    pauseSong(){
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch("/spotify/pause", requestOptions);
    }

    playSong() {
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch("/spotify/play", requestOptions);
    }

    skipSong() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        };
        fetch("/spotify/skip", requestOptions);
    }

    render() {
        const songProgress = (this.state.song.time / this.state.song.duration) * 100;
        return (
            <Card>
                <Grid container alignItems="center">
                    <Grid item align="center" xs={4}>
                        <img src={this.state.song.image_url} height="100%" width="100%" />
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography component="h5" variant="h5">
                            {this.state.song.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {this.state.song.artist}
                        </Typography>
                        <div>
                            <IconButton onClick={() => {this.state.song.is_playing ? this.pauseSong() : this.playSong()}}>
                                {this.state.song.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={this.skipSong}>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        )
    }
}