import React, { useState, useEffect, useRef } from 'react';
import API from '../../backend/API';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalOverflow from '@mui/joy/ModalOverflow';
import { Button, Typography, Grid, Box } from '@mui/material';
import { useUserContext } from '../../contexts/UserContext';
import useImage from '../../hooks/useImage';
import AvatarToggler from './AvatarToggler';


const USER_SPOTIFY_AVATAR_NAME = "My Spotify"

export default function ChooseAvatarModal() {
    const { user, setUserAndPlayers } = useUserContext();
    const [avatars, setAvatars] = useState([{avatarName: '', avatarUrl: ''}]);
    const [isLoading, setIsLoading] = useState(true);
    const currentAvatarRef = useRef({avatarName: '', avatarUrl: ''});
    

    useEffect(() => {
        const setAvailableAvatars = async () => {
            const response = await API.get('available-avatars');
            const data = response.data;
            let avatarsToSet = data.avatars.map((name) => {
                return {
                    avatarName: name.charAt(0).toUpperCase() + name.slice(1),
                    avatarUrl: useImage('avatar', name)
                }
            });
            if (user.isAuthenticated) {
                avatarsToSet = [{avatarName: USER_SPOTIFY_AVATAR_NAME, avatarUrl: user.image_url}, ...avatarsToSet];
            }
            setAvatars(avatarsToSet);
        };
        setAvailableAvatars();
        setIsLoading(false);
    }, []);

    const handleAvatarSelected = () => {
        API.post('select-avatar', {
            avatarName: currentAvatarRef.current.avatarName, 
            avatarUrl: currentAvatarRef.current.avatarUrl
        }).then((_) => {
            setUserAndPlayers({...user, avatarUrl: currentAvatarRef.current.avatarUrl});
        }).catch((error) => {
            console.log(error);
        });
    }

    return  (
        isLoading ? null : 
        <Modal
        open={true}
        color="primary"
        >
            <ModalOverflow>
                <ModalDialog variant='solid' color="primary">
                    <Box sx={{ width: {xs: '240px', sm: '300px', md: '450px', lg: '600px'}}}>
                        <Grid container spacing={2} align="center">
                            <Grid item xs={12}>
                                <Typography variant='h6'>
                                    Choose an Avatar
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <AvatarToggler avatars={avatars} currentAvatarRef={currentAvatarRef}/>
                            </Grid>
                            <Grid item xs={12} >
                                <Button variant="contained" color="secondary" onClick={handleAvatarSelected}>
                                    Select
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    )};