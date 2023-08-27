import React, { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { TextField, Grid, Button, Card, Typography, StepContent} from "@material-ui/core";
import MusicCard from "./MusicCard";

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
    const [currPage, setCurrPage] = useState(0);
    const [currentIds, setCurrentIds] = useState(new Set());
    const [selectedProps, setSelectedProps] = useState({});
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [prompts, setPrompts] = useState(new Array());
    const [promptIdx, setPromptIdx] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef(null);
    
    useEffect(() => {
        const setUp = async () => {
            const response = await fetch('/api/prompt');
            if (!response.ok){
                return
            }
            const data = await response.json();
            data.prompts.forEach((prompt) => {
                prompt.selection = ''
            })
            setPrompts(data.prompts);
            console.log(data.prompts);
        }
        setUp();
    }, [])

    const setSelectedCallback = (selectedProps) => {
        setSelectedProps(selectedProps);
    };

    const fetchMoreData = async () => {

        if (!q) {
            return
        }
       
        var page = currPage;

        const response = await axios.get(
            `http://127.0.0.1:8000/spotify/get-songs?query=${q}&page=${page}&limit=10`
        )
        // console.log(response.data);
        // console.log(page);
        
        if (!response.data.data.length) {
            setHasMore(false);
            return 
        }

        console.log(items);

        const elementsToAdd = new Array();

        response.data.data.forEach((element) => {
            if (currentIds.has(element.id)){
                console.log(element.id)
                return 
            }
            currentIds.add(element.id);
            elementsToAdd.push(element)
        })

        setItems([...items, ...elementsToAdd]);
        setCurrPage(page + 1);
    };

    // useEffect(() => {
    //     fetchMoreData();
    // }, []);

    useEffect(() => {
        console.log('what')
        if (currPage == 1) {
            fetchMoreData();
        }
    }, [currPage])

    const handleSearchEntered = (e) => {
        if(e.keyCode != 13){
            return
        }
        setItems([]);
        setHasMore(true);
        setCurrentIds(new Set());
        setCurrPage(1);
    }
    
    const handleSearchChange = (e) => {
        setQ(e.target.value);
        console.log(e.target.value);
    };

    const submitPrompts = () => {
        const returnData = new Array();
        prompts.forEach(prompt => {
            returnData.push({
                'prompt_id': prompt.id,
                'song_id': prompt.selection,
            })
        })
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({'prompts': returnData})
        };
        console.log('hello');
        fetch('/api/submit-song-selections', requestOptions).then((response) => {
            if (response.ok) {
              alert('Song Submitted Successfully')
              setSubmitted(true);
            } else {
                return response.json();
            }
          }).then((data) => {
              console.log('wtf');
              console.log(data);
              const message = data.message;
              alert(message);
          })
        return

    };

    const handleSubmitSongSelection = () => {
        // set the selected id for the given prompt to the selected song id
        // reset all the state variables on the page, with the exception of the query
        prompts[promptIdx].selection = selectedProps.id;
        inputRef.current.setBlank();
        setQ('');
        setPromptIdx(promptIdx + 1);
        setItems([]);
        setHasMore(true);
        setCurrentIds(new Set());
        setCurrPage(0);
        setSelectedProps({});
        if (promptIdx == prompts.length - 1) {
            var hasBlank = false;
            prompts.forEach(prompt => {
                if (prompt.selected == '') {
                    hasBlank = true;
                }
            });
            if (!hasBlank){
                submitPrompts();
            }
        }
    }

    const footerProps = selectedProps.id ? {
        ...selectedProps,
        selectable: false,
    } : {
        title: 'No Song Selected',
        image_url: BLANK_IMG_URL,
        selectable: false,
    };

    if (submitted){
        return <Typography variant="h6" component="h6">Waiting for Host</Typography>
    }

    return (
    <div className="box">
        <div className="row header" align="center">
            <Typography variant="h6" component="h6">
                Assigned Prompt:
            </Typography>
            <p>
                {prompts[promptIdx]?.prompt}
            </p>
            <InputForm
            id="filled-search"
            label="Select a Song"
            type="search"
            variant="filled"
            onChange={e => handleSearchChange(e)}
            onKeyDown={e => handleSearchEntered(e)}
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

