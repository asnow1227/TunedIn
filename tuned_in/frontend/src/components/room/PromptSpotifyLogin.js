import React, { useEffect } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { Button, Typography, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authenticateUsersSpotify } from '../../backend/API';


export default function PromptSpotifyLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const roomCode = location.state.roomCode;

    console.log(location.state.roomCode);

    useEffect(() => {
        if (!roomCode) navigate('/')
    })

    return  (
    <div>
        <Modal
        open={true}
        color="primary"
        >
            <ModalDialog variant='solid' color="primary">
                <Grid container spacing={2} align="center">
                    <Grid item xs={12}>
                        <Typography variant='h6'>
                            Login with Spotify to get the most out of your experience
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {/* <ButtonGroup disableElevation variant="contained" color="primary"> */}
                        <Button 
                        variant="outlined"
                        onClick={() => { authenticateUsersSpotify() }}  
                        sx={(theme) => ({
                        backgroundColor: theme.palette.primary.alternative,
                        color: "white",
                        borderColor: theme.palette.primary.alternative,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.alternative,
                            opacity: .6,
                            color: "white",
                            borderColor: theme.palette.secondary.main,
                        }
                        })}>
                            Login with Spotify
                        </Button>
                    </Grid>
                    <Grid item xs={12} >
                        <Button 
                        variant="outlined"
                        onClick={() => { navigate(`/room/${roomCode}`) }}  
                        sx={(theme) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: "white",
                        borderColor: theme.palette.primary.alternative,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.main,
                            opacity: .6,
                            color: "white",
                            borderColor: theme.palette.secondary.main,
                        }
                        })}>
                            Continue without Spotify
                        </Button>
                        {/* </ButtonGroup> */}
                    </Grid>
                </Grid>
            </ModalDialog>
        </Modal>
    </div>
    )};