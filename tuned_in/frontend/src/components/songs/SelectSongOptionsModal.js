import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import { Button, Box } from '@mui/material';
import ModalOverflow from '@mui/joy/ModalOverflow';
import { useSongSelectionContext } from '../../contexts/SelectedSongContext';
import { Spotify } from 'react-spotify-embed';
import { usePromptContext } from '../../contexts/PromptContext';

export default function SelectSongOptionsModal({ type }) {
    const { selectedSong, setSelectedSong } = useSongSelectionContext();
    const { submit } = usePromptContext();

    const onSelect = () => {
        submit(selectedSong);
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
                            { type === "select" ? "Select Song" : "Vote for Song" }
                        </Button>
                    </Box>
                </ModalDialog>
            </ModalOverflow>
        </Modal>
    )};