import React, { Fragment, useEffect, useRef } from "react";
import SpotifySearch from "../components/SpotifySearch";
import API from "../backend/API";
import useObjectState from "../hooks/useObjectState";
import { Typography } from "@material-ui/core";

export default function SelectSongPage(props){
    const [prompt, setPrompt] = useObjectState({id: null, text: ""});
    const selectedSongRef = useRef('');

    useEffect(() => {
        const setUp = async () => {
            try {
                const response = await API.get('prompt');
                setPrompt({id: response.data.prompt_id, text: response.data.text});
            } catch (error) {
                console.log(error);
            }
        }
        setUp();
    }, []);

    return (
        <Fragment>
            <Typography variant="h6" component="h6">
                {'Assigned Prompt: ' + selectedSongRef.current}
            </Typography>
            <SpotifySearch selectedSongRef={selectedSongRef} />
        </Fragment>
    );
};
