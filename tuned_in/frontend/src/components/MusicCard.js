import React, { useState, useCallback, useEffect } from "react";
import { Grid, Typography, Card, IconButton } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";


const style = {
    height: 30,
    border: "1px solid green",
    margin: 6,
    padding: 8
};

export default function MusicCard(props){
    const selectable = props.selectable == false ? props.selectable : true;
    const selected = props.selected == false ? props.selected : 
        (props.selectedId == props.id);
    const [style, setStyle] = useState({
        display: 'none'
    });

    const handleIconClicked = () => {
        selected ? props.setSelectedCallback({}) : 
        props.setSelectedCallback(props);
    }

    const displayButtons = () => {
        return (
            <IconButton 
            onClick={handleIconClicked} 
            style={style}
            >
                {
                selected ?  
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

    return (
        <Grid item xs={12}>
            <Card 
            height="64px" 
            onMouseEnter={() => {
                setStyle({
                    display: 'block'
                })
            }} 
            onMouseLeave={() => {
                setStyle({
                    display: 'none'
                })
            }}
            style={
                selected ? 
                {backgroundColor: "green"} :
                {backgroundColor: "white"}
            }
            >
                <Grid container alignItems="center">
                    <Grid item align="center" xs={4}>
                        <img src={props.image_url} height="64px" width="64px" />
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography component="h6" variant="h6">
                            {props.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {props.artist}
                        </Typography>
                        {selectable === true ? displayButtons() : null}
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}