import React, { useState, useCallback, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { TextField, Grid, Button, Card, Typography, StepContent} from "@material-ui/core";
import MusicCard from "./MusicCard";

const style = {
  margin: "0 auto",
};

const BLANK_IMG_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

export default function SelectSongPage(props){
    const [items, setItems] = useState(new Array());
    const [hasMore, setHasMore] = useState(true);
    const [q, setQ] = useState('');
    const [currPage, setCurrPage] = useState(1);
    const [currentIds, setCurrentIds] = useState(new Set());
    const [selectedProps, setSelectedProps] = useState({});
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [prmpt, setPrmpt] = useState('');
    
    useEffect(() => {
        const setUp = async () => {
            const response = await fetch('/api/prompt');
            if (!response.ok){
                return
            }
            const data = await response.json();
            setPrmpt(data.prompt)
        }
        setUp();
    })

    const setSelectedCallback = (selectedProps) => {
        setSelectedProps(selectedProps);
    };

    const fetchMoreData = async (from_search=false) => {
        // a fake async api call like which sends
        // 20 more records in 1.5 secs
        var page = currPage;
        if (from_search) {
            page = 1;
        }
        const response = await axios.get(
            `http://127.0.0.1:8000/spotify/get-songs?query=${q}&page=${page}&limit=10`
        )
        console.log(response.data);
        console.log(page);
        
        if (!response.data.data.length) {
            setHasMore(false);
            return 
        }

        const elementsToAdd = new Array()

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

    useEffect(() => {
        fetchMoreData();
    }, []);
    
    const handleSearchChange = (e) => {
        setItems([]);
        setHasMore(true);
        setCurrPage(1);
        setQ(e.target.value);
        setCurrentIds(new Set());
        fetchMoreData(true);
    };

    const handleSubmitPrompt = (e) => {
        return
    }

    const footerProps = selectedProps.id ? {
        ...selectedProps,
        selectable: false,
    } : {
        title: 'No Song Selected',
        image_url: BLANK_IMG_URL,
        selectable: false,
    };

    return (
    <div className="box">
        <div className = "row header" align="center">
            <Typography variant="h6" component="h6">
                Assigned Prompt:
            </Typography>
            <p>
                {prmpt}
            </p>
            <TextField
            id="filled-search"
            label="Select a Song"
            type="search"
            variant="filled"
            onChange={e => handleSearchChange(e)}
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
            <Grid container spacing={1} align="center">
            <Typography variant="h6" component="h6">Selected Song</Typography>
            <MusicCard {...footerProps} selected={false}/>
            <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSubmitPrompt}>
                {submitted === true ? "Unsubmit" : "Submit"}
                </Button>
          </Grid>
          </Grid>
        </div>
    </div>

    );
};

