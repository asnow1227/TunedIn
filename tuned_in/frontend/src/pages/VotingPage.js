import React, { Fragment, useEffect, useState } from "react";
import API from "../backend/API";
import PromptContext from "../contexts/PromptContext";
import useUserReady from "../hooks/useUserReady";
import SongSelectionContext from "../contexts/SelectedSongContext";
import SelectSongOptionsModal from "../components/songs/SelectSongOptionsModal";
import RoomHeader from "../components/room/RoomHeader";
import { Box, Grid, Typography } from "@mui/material";
import { Row, flexBoxProps } from "../components/shared/Layout";
import SongCard from "../components/songs/SongCard";


export default function VotingPage() {
    const [prompt, setPrompt] = useState("");
    const [promptAssignments, setPromptAssignments] = useState(new Array());
    const [selectedSong, setSelectedSong] = useState(null);
    const [canVote, setCanVote] = useState(false);
    const setUserReady = useUserReady();

    const submit = async (song) => {
        try {
            const response = await API.post('submit-vote', { 
                prompt_assignment_id: song.prompt_assignment_id 
            });
        } catch {
            console.log('error on prompt assignment submit');
        }
        
    };

    useEffect(() => {
        const fetchVotingRoundData = async () => {
            const response = await API.get('voting-round');
            setPrompt(response.data.prompt_text);
            setPromptAssignments(response.data.prompt_assignments);
            setCanVote(response.data.canVote);
        };

        fetchVotingRoundData();

    }, []);

    return (
        <Fragment>
            <RoomHeader />
            <Row>
                <Typography variant="h6">
                        Choose the song that best matches the prompt:
                </Typography>
                <Typography variant="h4">
                    { '"' + prompt + '"' }
                </Typography>
                <PromptContext.Provider value={{ submit }} >
                    <SongSelectionContext.Provider value={{ selectedSong, setSelectedSong }} >
                        { canVote && <SelectSongOptionsModal type="vote"/> }
                        <Box sx={{ width: { xs: "100%", md: "80%" }}} >
                            <Grid 
                            container
                            spacing={1}
                            direction="column"
                            justifyContent="center"
                            sx={{ minHeight: '80vh' }}
                            >
                                <Grid item xs={12}>
                                    <SongCard { ...promptAssignments[0] } />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h4">
                                        VS.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <SongCard { ...promptAssignments[1] } />
                                </Grid>
                            </Grid>
                        </Box>
                    </SongSelectionContext.Provider>
                </PromptContext.Provider>
            </Row>
        </Fragment>
    )

}