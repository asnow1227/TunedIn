import React, { Component } from 'react';
import { Grid, Typography, Card, IconButton } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";


const style = {
    height: 30,
    border: "1px solid green",
    margin: 6,
    padding: 8
};

export default class MusicCard extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            hovered: false,
            selected: false,
            iconHovered: false,
            style: {
                display: 'none'
            }
        }
        this.handleIconClicked = this.handleIconClicked.bind(this);
        this.displayButtons = this.displayButtons.bind(this);
    }

    handleIconClicked(){
        this.state.selected ? 
            this.props.selectedCallback({}, this):
            this.props.selectedCallback(this.props, this);
        this.setState({
            selected: !this.state.selected,
        });
    }

    displayButtons(){
        return (
            <IconButton 
            onClick={this.handleIconClicked} 
            style={this.state.style}
            >
                {
                this.state.selected ?  
                <HighlightOffIcon
                color="error"
                 /> : 
                 <CheckCircleIcon 
                style={{color: "green"}}
                 />
                 }
            </IconButton>
        )
    }

    render() {
        return (
            <Grid item xs={12}>
                <Card 
                height="64px" 
                onMouseEnter={() => {
                    this.setState({
                        style: {
                            display: 'block'
                        }
                    })
                }} 
                onMouseLeave={() => {
                    this.setState({
                        style: {
                            display: 'none'
                        }
                    })
                }}
                style={
                    this.state.selected ? 
                    {backgroundColor: "#C8F7C8"} :
                    {backgroundColor: "white"}
                }
                >
                    <Grid container alignItems="center">
                        <Grid item align="center" xs={4}>
                            <img src={this.props.image_url} height="64px" width="64px" />
                        </Grid>
                        <Grid item align="center" xs={8}>
                            <Typography component="h8" variant="h8">
                                {this.props.title}
                            </Typography>
                            <Typography color="textSecondary" variant="subtitle1">
                                {this.props.artist}
                            </Typography>
                            {this.displayButtons()}
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        )
    }

}