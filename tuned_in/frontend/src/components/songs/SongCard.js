import React from "react";
import { Card, CardContent, Typography, AspectRatio, CardOverflow, Box } from "@mui/joy";
import { BsThreeDots } from "react-icons/bs";
import useTheme from "@mui/material/styles/useTheme";
import IconButton from "@mui/material/IconButton"; 


export default function SongCard(props){

    const theme = useTheme();

    console.log(props);

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
        <CardContent orientation="horizontal">
            <Box sx={{ display: "flex", alignItems:"left", textAlign:"left", flexDirection: "column", justifyContent: "center" }}>
                <Typography level="title-lg" textColor="white">
                    {props.title}
                </Typography>
                <Typography textColor="#b3b3b3" level="body-sm">
                    {props.artist}
                </Typography>
            </Box>
        </CardContent>
        { !props?.disabled &&
        <CardOverflow>
             <Box sx={{ display: "flex", alignItems:"left", textAlign:"left", flexDirection: "column", justifyContent: "center", marginRight: "5px" }}>
                 <IconButton onClick={props.onClick}>
                     <BsThreeDots color={theme.palette.secondary.main}/>
                 </IconButton>
             </Box>
         </CardOverflow>}
    </Card>
    )
}