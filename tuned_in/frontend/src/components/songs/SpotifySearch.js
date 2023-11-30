import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, Fragment } from "react";
import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import { SPOTIFY_API } from "../../backend/API";
import InfiniteScroll from "react-infinite-scroll-component";
import useDebounce from "../../hooks/useDebounce";
import { Row } from "../shared/Layout";
import { flexBoxProps } from "../shared/Layout";
import RoomHeader from "../room/RoomHeader";
import SongFeed from "./SongFeed";
import SongSelectionContext from "../../providers/SelectedSongContext";
// import HostTimerTest from "../shared/HostTimer";

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
    return <TextField fullWidth {...props} inputRef={inputRef}/>;
});


export default function SpotifySearch() {
    const [items, setItems] = useState(new Array());
    const [hasMore, setHasMore] = useState(true);
    const [q, setQ] = useState('');
    const debouncedQ = useDebounce(q, 500);
    const [currPage, setCurrPage] = useState(1);
    const inputRef = useRef(null);
    const [selectedSong, setSelectedSong] = useState(null);

    useEffect(() => {
        setCurrPage(1);
        setItems(new Array());
        setHasMore(!!debouncedQ);
        if (debouncedQ){
            fetchMoreData();
        }
    }, [debouncedQ]);

    const fetchMoreData = async () => {
        const response = await SPOTIFY_API.get('get-songs', {'params': {'query': q, 'page': currPage, 'limit': 10}});
        if (!response.data.data.length) {
            setHasMore(false);
            return;
        }
        setItems(prev => [...prev, ...response.data.data]);
        setCurrPage(prev => prev + 1);
    };

    return (
    <Fragment>
        <RoomHeader align="center">
            <Box sx={{  
                ...flexBoxProps, 
                marginTop: { 
                    xs: ".5rem",
                    md: "1rem",
                    lg: "2rem"
                },
                marginRight: "1rem",
                marginBottom: { 
                    xs: ".5rem",
                    md: "1rem",
                    lg: "2rem"
                }
                }}>
                <InputForm
                // FormControlProps={{style: {borderRadius: "12px"}}}
                className="inputRounded"
                id="filled-search"
                label="Select a Song"
                type="search"
                variant="outlined"
                onChange={e => setQ(e.target.value)}
                ref={inputRef}
                />
            </Box>
        </RoomHeader>
        <Row align="center">
            <Box sx={{width: {sx: "100%", md: "90%", lg: "80%"}, marginTop: "30px"}}>
                <InfiniteScroll
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableDiv"
                >
                    <SongSelectionContext.Provider value={{ selectedSong, setSelectedSong }}>
                        <SongFeed songs={items}/>
                    </SongSelectionContext.Provider>
                </InfiniteScroll>
            </Box>
        </Row>
    </Fragment>)
};

