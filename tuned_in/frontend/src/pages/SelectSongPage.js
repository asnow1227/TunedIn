import React, { Fragment, useEffect, useRef } from "react";
import SpotifySearch from "../components/songs/SpotifySearch";
import API from "../backend/API";
import useObjectState from "../hooks/useObjectState";
import { Typography, Button, Box } from "@mui/material";
import { Footer, MainBox } from "../components/shared/Layout";
import { HostTimerTest } from "../components/shared/HostTimer";
// import { Button } from "@mui/material";

export default function SelectSongPage(props){
    const [prompt, setPrompt] = useObjectState({id: null, text: ""});
    const selectedSongRef = useRef('')

    useEffect(() => {
        const setUp = async () => {
            try {
                const response = await API.get('prompt');
                setPrompt({id: response.data.id, text: response.data.text});
            } catch (error) {
                console.log(error);
            }
        }
        setUp();
    }, []);

    return (
        <Fragment>
            <SpotifySearch selectedSongRef={selectedSongRef} />
            <Footer>
                <Box sx={{width: {sx: "100%", md: "90%", lg: "80%"}}}>
                    <HostTimerTest />
                    <Typography variant="h6" component="h6">
                        {'Assigned Prompt: ' + prompt.text}
                    </Typography>
                </Box>
            </Footer>
        </Fragment>
    );
};

