import React, { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
// import _debounce from "lodash/debounce";
import API, { SPOTIFY_API } from "../backend/API";
import useObjectState from "../hooks/useObjectState";
import axios from "axios";
import { TextField, Grid, Button, Card, Typography, StepContent} from "@material-ui/core";
import MusicCard from "./MusicCard";
import useDebounce from "../hooks/useDebounce";

const style = {
  margin: "0 auto",
};

const BLANK_IMG_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const InputForm = forwardRef((props, ref) => {
    const inputRef = useRef(null);
    useImperativeHandle(ref, () => {
        return {
            setBlank: () => {
                console.log(inputRef.current.value);
                inputRef.current.value = '';
            }
        }
    }, []);

    return <TextField {...props} inputRef={inputRef}/>;
});


export default function SelectSongPage(props){
    const [items, setItems] = useState(new Array());
    const [hasMore, setHasMore] = useState(true);
    const [q, setQ] = useState('');
    const debouncedQ = useDebounce(q, 500);
    const [currPage, setCurrPage] = useState(1);
    // const [currentIds, setCurrentIds] = useState(new Set());
    const [selectedProps, setSelectedProps] = useState({});
    const [prompt, setPrompt] = useObjectState({id: null, text: ""});
    // const [prompts, setPrompts] = useState(new Array());
    // const [promptIdx, setPromptIdx] = useState(0);
    // const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef(null);

    if (currPage == 1){
        fetchMoreData();
    }

    useEffect(() => {
        if (!debouncedQ) {
            setItems(new Array());
            setHasMore(false);
            return
        }
        setCurrPage(1);
    }, [debouncedQ])
    
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

    const setSelectedCallback = (selectedProps) => {
        setSelectedProps(selectedProps);
    };

    // const handleSearchEntered = () => {
    //     setItems([]);
    //     setHasMore(true);
    //     setCurrentIds(new Set());
    //     setCurrPage(1);
    // }

    const fetchMoreData = async () => {

        const response = await SPOTIFY_API.get('get-songs', {
            'params': {
                'query': q,
                'page': currPage,
                'limit': 10,
            }
        });

        if (!response.data.data.length) {
            setHasMore(false);
            return;
        }

        setItems((prev) => [...prev, response.data.data]);
        setCurrPage(page + 1);
        // const elementsToAdd = new Array();
        // response.data.data.forEach((element) => {
        //     if (currentIds.has(element.id)){
        //         console.log(element.id)
        //         return 
        //     }
        //     currentIds.add(element.id);
        //     elementsToAdd.push(element)
        // })

        // setItems([...items, ...elementsToAdd]);
        // setCurrPage(page + 1);
    };

    // const handleSearchChange = (e) => {
    //     setQ(e.target.value);
        // debouncedHandleSearchEntered();
    // };

    // const submitPrompts = () => {
    //     let returnData = prompts.map((elem) => {
    //         return {prompt_id: prompt.id, song_id: prompt.selection};
    //     });
    //     API.post('submit-song-selection', {'prompts': returnData}).then((response) => {
    //         alert('Song Submitted Successfully')
    //         setSubmitted(true);
    //     }).catch((error) => alert(error.message));
    // };

    // const handleSubmitSongSelection = () => {
        // set the selected id for the given prompt to the selected song id
        // reset all the state variables on the page, with the exception of the query
        // prompts[promptIdx].selection = selectedProps.id;
        // inputRef.current.setBlank();
        // // setQ('');
        // setPromptIdx(promptIdx + 1);
        // setItems([]);
        // setHasMore(true);
        // setCurrentIds(new Set());
        // setCurrPage(0);
        // setSelectedProps({});
        // if (promptIdx == prompts.length - 1) {
        //     var hasBlank = false;
        //     prompts.forEach(prompt => {
        //         if (prompt.selected == '') {
        //             hasBlank = true;
        //         }
        //     });
        //     if (!hasBlank){
        //         submitPrompts();
        //     }
        // }
    // }

    const handleSubmitSongSelection = () => {
        API.post('prompt', {prompt_id: prompt.id, song_id: selectedProps.id});

    }

    const footerProps = selectedProps.id ? {
        ...selectedProps,
        selectable: false,
    } : {
        title: 'No Song Selected',
        image_url: BLANK_IMG_URL,
        selectable: false,
    };

    // if (submitted){
    //     return <Typography variant="h6" component="h6">Waiting for Host</Typography>
    // }

    return (
    <div className="box">
        <div className="row header" align="center">
            <Typography variant="h6" component="h6">
                Assigned Prompt:
            </Typography>
            <p>
                {prompt.text}
            </p>
            <InputForm
                id="filled-search"
                label="Select a Song"
                type="search"
                variant="filled"
                onChange={e => setQ(e.target.value)}
                // onKeyDown={e => handleSearchEntered(e)}
                ref={inputRef}
            />
        </div>
        <div id="scrollableDiv" className="row content" align="center">
            <hr></hr>
            <InfiniteScroll
                className="white-outline"
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableDiv"
            >
            <Grid container align="center" spacing={1}>
            {items.map((i, index) => (
                <MusicCard {...i} key={index} setSelectedCallback={setSelectedCallback} selectedId={selectedProps.id}/>)
            )}
            </Grid>
            </InfiniteScroll>
        </div>
        <div className="row footer" align="center">
            <hr></hr>
            <Grid container align="center" spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="h6" component="h6">Selected Song</Typography>
                </Grid>
                <Grid item xs={12}>
                    <MusicCard {...footerProps} selected={false}/>
                </Grid>
                <Grid item xs={12}>
                    {   selectedProps?.id ? 
                        <Button variant="contained" color="primary" onClick={handleSubmitSongSelection}>
                            Submit
                        </Button> : null
                    }
                    
                </Grid>
            </Grid>
        </div>
    </div>

    );
};

