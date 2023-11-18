import React, { useState, useRef } from 'react';
import API from '../../backend/API';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Typography, Grid } from '@mui/material';
import { useUserContext } from '../../providers/UserContext';
import { useGlobalSettingsContext } from '../../providers/GlobalSettingsProvider';
import LocalSettingsContext from '../../providers/LocalSettingsProvider';
import AudioPlaybackSettings from './AudioPlaybackSettings';
import SongSelectionTimerSettings from './SongSelectionTimerSettings';


export default function UpdateSettingsModal() {
    const { user } = useUserContext();
    const { settings, setSettings, settingsOpen, setSettingsOpen } = useGlobalSettingsContext();
    const [localSettings, setLocalSettings] = useState({
        ...settings,
        hostDeviceOnly: settings.hostDeviceOnly === null ? user.isAuthenticated : settings.hostDeviceOnly,
    });
    const localSettingsRef = useRef(localSettings);


    // const handleAvatarSelected = () => {
    //     API.post('select-avatar', {
    //         avatarName: currentAvatarRef.current.avatarName, 
    //         avatarUrl: currentAvatarRef.current.avatarUrl
    //     }).then((_) => {
    //         setUserAndPlayers({...user, avatarUrl: currentAvatarRef.current.avatarUrl});
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // }

    return  (
    <LocalSettingsContext.Provider value={{ localSettings, setLocalSettings, localSettingsRef }}>
        <Modal
        open={ settingsOpen || settings.hostDeviceOnly === null }
        color="primary"
        onClose={() => setSettingsOpen(false)}
        >
            <ModalDialog variant='solid' color="primary">
                { settings.hostDeviceOnly != null && <ModalClose />}
                <Grid container spacing={3} align="center">
                    <Grid item xs={12}>
                        <Typography variant='h3'>
                            Settings
                        </Typography>
                    </Grid>
                    <Grid item xs={12} align="left">
                        <AudioPlaybackSettings />
                    </Grid>
                    <Grid item xs={12} align="left">
                        <SongSelectionTimerSettings />
                    </Grid>
                    <Grid item xs={12} >
                        <Button variant="contained" color="secondary" onClick={() => console.log(localSettingsRef)}>
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </ModalDialog>
        </Modal>
    </LocalSettingsContext.Provider>
    )};