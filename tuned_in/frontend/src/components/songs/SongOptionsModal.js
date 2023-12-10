import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Box } from '@mui/material';
import ModalOverflow from '@mui/joy/ModalOverflow';
import { useSongSelectionContext } from '../../providers/SelectedSongContext';
import { Spotify } from 'react-spotify-embed';
import { usePromptContext } from '../../providers/PromptContext';

export default function SongOptionsModal() {
    const { selectedSong, setSelectedSong } = useSongSelectionContext();
    const { submit } = usePromptContext();

    const onSelect = () => {
        submit(selectedSong);
        console.log('submit is being called through the onSelect of the Button to choose a song');
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
                        <Button variant="contained" color="secondary" onClick={onSelect} sx={{ width: "100%", marginBottom: "10px" }}>
                            Select Song
                        </Button>
                    </Box>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    )};