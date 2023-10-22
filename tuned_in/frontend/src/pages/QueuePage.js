import React, { Fragment } from "react";
import { Button, ButtonGroup, Typography, Box, Grid } from '@mui/material';
import { Footer } from "../components/Layout";
import { Row} from "../components/Layout"
import PlayerCard from "../components/PlayerCard";
import AVATARS from "../components/Avatars";
import CreatePromptsPage from "./EnterPromptsPage";
import { SPOTIFY_GREEN } from "./App";

const randomAvatar = () => {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

function QueuePage(props){
    return (
    <Fragment>
        <Row>
            <Typography variant="h3">
                Lobby
            </Typography>
            <Typography variant="subtitle2">
                {`Code: ${props.roomCode}`}
            </Typography>
            <Box sx={{width: { xs: "100%", md: "75%", lg: "50%", marginTop: "30px", marginBottom: "30px"}}}>
                <hr color={SPOTIFY_GREEN} />
            </Box>
            <Box sx={{width: { xs: "100%", md: "75%", lg: "50%"}}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="paragraph">
                            Waiting on others to join. Fill out some prompts in the meantime:
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <CreatePromptsPage />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{width: { xs: "100%", md: "75%", lg: "50%"}}}>
                <hr color={SPOTIFY_GREEN} style={{marginBottom: "30px", marginTop:"30px"}}/>
                <Typography variant="h6" style={{marginBottom: "30px"}}>
                    Current Players:
                </Typography>
                <Grid container spacing={2}>
                    {props.players.map(function(alias, i){
                        return (
                            <Fragment key={i}>
                                <PlayerCard alias={alias} image_url={randomAvatar()} score={0}/>
                            </Fragment>
                        )
                    })}
                </Grid>
            </Box>
        </Row>
        <Footer>
        {
            props.isHost && 
            <ButtonGroup disableElevation variant="contained" color="primary" sx={{marginTop: "10px", marginBottom: "10px"}}>
                <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => props.setUserReady()} 
                sx={{maxWidth: '100px', maxHeight: '40px', minWidth: '100px', minHeight: '40px'}}
                > 
                    Ready
                </Button>
                <Button 
                variant="contained"  
                color="secondary" 
                onClick={props.leaveButtonPressed}
                sx={{maxWidth: '100px', maxHeight: '40px', minWidth: '100px', minHeight: '40px'}}
                > 
                    End
                </Button>
            </ButtonGroup>
        }
        </Footer>
    </Fragment>
    )
}

export default QueuePage;