import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, Fragment } from "react";
import { Grid, TextField } from "@material-ui/core";
import Box from "@material-ui/core/Box"
import { SPOTIFY_API } from "../backend/API";
import InfiniteScroll from "react-infinite-scroll-component";
import MusicCard from "../components/MusicCard";
import useDebounce from "../hooks/useDebounce";
import { Row, Header } from "./Layout";


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


export default function SpotifySearch({selectedSongRef}) {
    const [items, setItems] = useState(new Array());
    const [hasMore, setHasMore] = useState(true);
    const [q, setQ] = useState('');
    const debouncedQ = useDebounce(q, 500);
    const [currPage, setCurrPage] = useState(1);
    const [selectedProps, setSelectedProps] = useState({});
    const inputRef = useRef(null);

    selectedSongRef.current = selectedProps?.id

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
        setItems([...items, ...response.data.data]);
        setCurrPage(currPage + 1);
    };

    const setSelectedCallback = (selectedProps) => {
        setSelectedProps(selectedProps);
    };

    return (
    <Fragment>
        <Header align="center">
            <Box style={{width: "70%"}}>
                <InputForm
                style={{background: "white", borderRadius: "12px"}}
                InputProps={{style: {borderRadius: "8px"}}}
                id="filled-search"
                label="Select a Song"
                type="search"
                variant="filled"
                onChange={e => setQ(e.target.value)}
                ref={inputRef}
                />
            </Box>
        </Header>
        <Row align="center">
            <Box style={{width: "70%"}}>
                <InfiniteScroll
                dataLength={items.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableDiv"
                >
                    <Grid container spacing={2}>
                        {items.map((i, index) => (
                            <MusicCard 
                            {...i} 
                            key={index} 
                            setSelectedCallback={setSelectedCallback} 
                            selectedId={selectedProps.id}/>)
                        )}
                    </Grid>
                </InfiniteScroll>
            </Box>
        </Row>
    </Fragment>
    )

}