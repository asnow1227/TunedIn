import React, { Fragment, useEffect, useRef } from "react";
import SpotifySearch from "../components/songs/SpotifySearch";
import API from "../backend/API";
import useObjectState from "../hooks/useObjectState";
import { Typography, Button, Box } from "@mui/material";
import { Footer, MainBox } from "../components/shared/Layout";
import HostTimer from "../components/shared/HostTimer";
import PromptContext from "../providers/PromptContext";
import useUserReady from "../hooks/useUserReady";
import { useGamestateContext } from "../providers/GameStateContext";
// import { Button } from "@mui/material";

export default function SelectSongPage(props){
    const [prompt, setPrompt] = useObjectState({ id: null, text: "" });
    const setUserReady = useUserReady();

    const fetchPrompt = async () => {
        try {
            const response = await API.get('prompt');
            if (response.data.text) {
                setPrompt({ id: response.data.id, text: response.data.text });
            } else {
                setUserReady();
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchPrompt();
    }, []);

    const submit = async (song) => {
        await API.post('submit-song-selection', {
            prompt_id: prompt.id,
            ...song,
        });
        await fetchPrompt();
    }

    return (
        <Fragment>
            <PromptContext.Provider value={{ prompt, submit }}>
                <SpotifySearch />
                <Footer>
                    <Box sx={{ width: {sx: "100%", md: "90%", lg: "80%"}, marginTop: "10px" }}>
                        <Typography variant="h6" component="h6">
                            {'Assigned Prompt: ' + prompt.text}
                        </Typography>
                        <HostTimer />
                    </Box>
                </Footer>
            </PromptContext.Provider>
        </Fragment>
    );
};

