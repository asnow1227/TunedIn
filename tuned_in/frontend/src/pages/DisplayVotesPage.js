import React, { useEffect, useState, Fragment } from "react";
import PlayerCard from "../components/players/PlayerCard";
import SongCard from "../components/songs/SongCard";
import { Box, Typography, Grid } from "@mui/material"
import RoomHeader from "../components/room/RoomHeader";
import { Row } from "../components/shared/Layout";
import API from "../backend/API";


export function DisplayVotesFrame({ prompt, players,  songs, votes }){
    return (
        <Fragment>
            <Row>
                <Typography variant="h6">
                        Votes
                </Typography>
                <Typography variant="h4">
                    { '"' + prompt + '"' }
                </Typography>
                <Box sx={{ width: { xs: "100%", md: "80%" }}} >
                    <Grid 
                    container
                    spacing={1}
                    direction="column"
                    justifyContent="center"
                    sx={{ minHeight: '80vh' }}
                    >
                        <Grid item xs={12}>
                            <SongCard { ...songs[0] } disabled />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <VotingPanel { ...votes[0] } />
                        </Grid> */}
                        <Grid item xs={12}>
                            <PlayerCard { ...players[0] } />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h4">
                                VS.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <SongCard { ...songs[1] } disabled />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <VotingPanel { ...votes[0] } />
                        </Grid> */}
                        <Grid item xs={12}>
                            <PlayerCard { ...players[1] } />
                        </Grid>
                    </Grid>
                </Box>
            </Row>
        </Fragment>
    )
};

export default function DisplayVotesPage(){
    const [displayVotesData, setDisplayVotesData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchDiplayVotesData = async () => {
            const response = await API.get('display-votes-page');
            console.log(response.data);
            setDisplayVotesData(response.data);
            setIsLoading(false);
        };

        fetchDiplayVotesData();
    }, [])

    return (
        !isLoading && 
        <DisplayVotesFrame
        prompt={displayVotesData.prompt}
        players={displayVotesData.players} 
        songs={displayVotesData.songs} 
        votes={displayVotesData.votes}/>
    );
}