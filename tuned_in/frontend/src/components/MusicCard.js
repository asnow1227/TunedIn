import React, { useState } from "react";
import { Grid, Typography, IconButton, Box, useTheme } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { Card, CardOverflow, CardContent, AspectRatio, Divider, Button, CardActions, Link } from "@mui/joy";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import { Spotify } from 'react-spotify-embed';



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
            <IconButton onClick={handleIconClicked} style={style}>
                { selected ?  <HighlightOffIcon color="error" /> : <CheckCircleIcon style={{color: "green"}}/> }
            </IconButton>
        )
    }

    return (
        <Grid item xs={12}>
            <Card
             height={150}
             orientation="horizontal"
             variant="plain card"
             style={{backgroundColor: "black"}}
            >
                <CardOverflow>
                    <AspectRatio ratio="1" sx={{ width: 150 }}>
                        <img src={props.image_url} loading="lazy" alt=""/>
                    </AspectRatio>
                </CardOverflow>
                <CardContent>
                    <Typography variant="h6" color="white">
                        {props.title}
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle2">
                        {props.artist}
                    </Typography>
                    <Box width={1}>
                        <Button sx={{backgroundColor:"#1DB954", color:"white"}} size="sm">
                            Select
                        </Button>
                        {/* <Button variant="solid" size="sm">
                            Preview
                        </Button> */}
                    </Box>
                </CardContent>
               
                <CardOverflow
                    variant="soft"
                    color="primary"
                    sx={{
                    px: 0.2,
                    // writingMode: 'vertical-rl',
                    textAlign: 'center',
                    align: 'center',
                    fontSize: 'xs',
                    fontWeight: 'xl',
                    letterSpacing: '1px',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    }}
                >
                    <Link underline="none" overlay>
                        <div className="rotated">
                            <Typography>
                                Preview
                            </Typography>
                        </div>
                    </Link>
                </CardOverflow>
            </Card>
        </Grid>
    )
}