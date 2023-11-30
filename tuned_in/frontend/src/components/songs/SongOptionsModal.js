import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Grid, Box } from '@mui/material';
import { useUserContext } from '../../providers/UserContext';
import ModalOverflow from '@mui/joy/ModalOverflow';
import { useSongSelectionContext } from '../../providers/SelectedSongContext';
import { AspectRatio, Typography } from '@mui/joy';
import { Spotify } from 'react-spotify-embed';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function SongOptionsModal() {
    const { selectedSong, setSelectedSong } = useSongSelectionContext();
    const { user } = useUserContext();
    const theme = useTheme();

    const onSave = () => {
        console.log(selectedSong);
        setSelectedSong(null);
    }

    return  (
        <Modal
        open={!!selectedSong}
        color="primary"
        onClose={() => setSelectedSong(null)}
        sx={{ align: "center" }}
        >
            <ModalOverflow>
                <ModalDialog variant='solid' color="primary">
                    <ModalClose onClick={() => setSelectedSong(null)}/>
                    <Box sx={{ width: {xs: '240px', sm: '300px', md: '450px', lg: '600px'}, display: "flex", flexDirection: "column"}}> 
                        <Spotify link={`https://open.spotify.com/track/${selectedSong?.id}`} width={"100%"} />
                        <Button variant="contained" color="secondary" onClick={onSave} sx={{ width: "100%", marginBottom: "10px" }}>
                            Select Song
                        </Button>
                    </Box>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    )};