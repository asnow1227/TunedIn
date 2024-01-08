import React, { useState, useRef, Fragment } from 'react';
import API from '../../backend/API';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Typography, Grid, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import { useGlobalSettingsContext } from '../../contexts/GlobalSettingsProvider';
import { useSocketContext } from "../../contexts/SocketContext"
import LocalSettingsContext from '../../contexts/LocalSettingsProvider';
import AudioPlaybackSettings from './AudioPlaybackSettings';
import SongSelectionTimerSettings from './SongSelectionTimerSettings';
import NumRoundsSettings from './NumRoundsSettings';
import ModalOverflow from '@mui/joy/ModalOverflow';

const Options = [
    AudioPlaybackSettings,
    SongSelectionTimerSettings,
    NumRoundsSettings
]

export default function UpdateSettingsModal({ isOpen, setIsOpen }) {
    const { user } = useUserContext();
    const socketManager = useSocketContext();
    const { settings } = useGlobalSettingsContext();
    const localSettingsRef = useRef({...settings, hostDeviceOnly: settings.hostDeviceOnly === null ? user.isAuthenticated : settings.hostDeviceOnly});
    const setLocalSettingsRef = (newAttrs) => {
        localSettingsRef.current = {...localSettingsRef.current, ...newAttrs};
    };

    const handleSave = () => {
        API.post('update-settings', localSettingsRef.current).then((_) => {
            socketManager.send('settings_update', localSettingsRef.current);
            setIsOpen(false);
        }).catch((error) => {
            console.log(error);
        });
    };

    const close = () => {
        setIsOpen(false);
    }

    return  (
    <LocalSettingsContext.Provider value={{ localSettingsRef, setLocalSettingsRef }}>
        <Modal
        open={isOpen}
        color="primary"
        onClose={close}
        sx={{ align: "center" }}
        >
            <ModalOverflow>
                <ModalDialog variant='solid' color="primary">
                    <Box sx={{ width: {xs: '240px', sm: '300px', md: '450px', lg: '600px'}}}>
                        <Grid container spacing={3} align="center">
                            <Grid item xs={12}>
                                <Typography variant='h3'>
                                    Settings
                                </Typography>
                            </Grid>
                            { Options.map((Option, index) => (
                                <Fragment key={index}>
                                    <Grid item xs={12} align="left">
                                        <Option />
                                    </Grid>
                                </Fragment>
                            ))}
                            <Grid item xs={12} >
                                <Button variant="contained" color="secondary" onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    </LocalSettingsContext.Provider>
    )};