import React from "react";
import { Grid } from "@mui/material";
import { Card, CardContent, Typography, AspectRatio, Button, CardCover, CardOverflow, Box, Link } from "@mui/joy";
import { BsThreeDots } from "react-icons/bs";
import useTheme from "@mui/material/styles/useTheme";
import IconButton from "@mui/material/IconButton"; 
import { useSongSelectionContext } from "../../providers/SelectedSongContext";


export default function MusicCard(props){
    const theme = useTheme();
    const { setSelectedSong } = useSongSelectionContext();

    const onClick = () => {
        setSelectedSong(props);
    }

    return (
    <Card
        height={125}
        orientation="horizontal"
        variant="outlined"
        sx={(theme) => ({
        backgroundColor: "black",
        borderColor: "black",
        '&:hover': { boxShadow: 'md', borderColor: `${theme.vars.palette.secondary.solidBg}` }
        })}
    >
        <CardOverflow>
            <AspectRatio ratio="1" sx={{ width: 125 }}>
                <img src={props.image_url} loading="lazy" alt=""/>
            </AspectRatio>
        </CardOverflow>
        {/* <Box sx={{display: "flex", alignItems:"center", textAlign:"left"}}> */}
            <CardContent orientation="horizontal">
                <Box sx={{display: "flex", alignItems:"left", textAlign:"left", flexDirection: "column", justifyContent: "center"}}>
                    <Typography level="title-lg" textColor="white">
                        {props.title}
                    </Typography>
                    <Typography textColor="#b3b3b3" level="body-sm">
                        {props.artist}
                    </Typography>
                </Box>
            </CardContent>
        <CardOverflow>
            <Box sx={{display: "flex", alignItems:"left", textAlign:"left", flexDirection: "column", justifyContent: "center", marginRight: "5px"}}>
                <IconButton onClick={onClick}>
                    <BsThreeDots color={theme.palette.secondary.main}/>
                </IconButton>
            </Box>
        </CardOverflow>
    </Card>
    )
}