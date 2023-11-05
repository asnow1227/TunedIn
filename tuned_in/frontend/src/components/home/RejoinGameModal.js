import React, { useState } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { Button, ButtonGroup, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useLeaveRoom from '../../hooks/useLeaveRoom';
import useExitRoom from '../../hooks/useExitRoom';
import { useRoomContext } from '../../providers/RoomContext';


export default function RejoinRoomModal({ roomCode }) {
    const navigate = useNavigate();
    const leaveRoom = useLeaveRoom(roomCode);
    const exitRoom = useExitRoom();
    const [open, setOpen] = useState(!!roomCode);
    console.log(roomCode);

    const leave = () => {
        setOpen(false);
        leaveRoom();
        exitRoom();
    }

    return  (
        <Modal
        open={open}
        color="primary"
        >
            <ModalDialog variant='solid' color="primary">
                <Grid container spacing={2} align="center">
                    <Grid item xs={12}>
                        <Typography variant='h6'>
                            It appears you are currently in a room
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='body1'>
                            {`(${roomCode})`}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='body1'>
                            Would you like to rejoin?
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <ButtonGroup disableElevation variant="contained" color="primary">
                            <Button color="secondary" onClick={() => navigate('/room/' + roomCode)}>
                                Yes
                            </Button>
                            <Button color="secondary" onClick={leave}>
                                No
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </ModalDialog>
        </Modal>
    )
}