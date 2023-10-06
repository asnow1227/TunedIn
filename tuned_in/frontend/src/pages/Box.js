import React, { useRef } from "react";
import { Box, Button, Typography, Grid } from "@material-ui/core";
import { Header, Footer, Row } from "../components/Layout";
import SpotifySearch from "../components/SpotifySearch";

export default function BoxComponent(props){
    const selectedSongRef = useRef('');
    return (
    <div className="box" align="center">
        {/* <Header>
            <Typography>
                Header
            </Typography>
        </Header>
        <Row>
            <Box height={.8}>
                <Grid container>
                    <Button>Click Me</Button>
                </Grid>
            </Box>
            <Box height={.2}>
                <Grid container>
                    <Typography>Click Me</Typography>
                </Grid>
            </Box>
        </Row>
       <Footer>
            <Typography>
                Footer
            </Typography>
        </Footer> */}
        <Header align="center">
            <Typography>
                Header
            </Typography>
        </Header>
        <SpotifySearch selectedSongRef={selectedSongRef}/>
        <Footer>
            <Typography>
                Footer
            </Typography>
        </Footer>
    </div>
    )
}