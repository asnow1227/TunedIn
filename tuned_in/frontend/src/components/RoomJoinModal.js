import React, { Fragment, useState, forwardRef } from 'react';
// import Popup from 'reactjs-popup';
import Modal from '@mui/joy/Modal';
import styles from '../../static/css/popup.module.css';
import RoomJoinComponent from './RoomJoinComponent';
import { Button } from "@mui/material";
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';


export default function RoomJoinModal(props) {
    const [open, setOpen] = useState(false);
    return (
        <Fragment>
            <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>
                Open
            </Button>
            <Modal
             open={open}
             onClose={() => setOpen(false)}
             color="primary"
            >
            <ModalDialog variant='solid' color="primary">
                <ModalClose />
                <RoomJoinComponent />
            </ModalDialog>
            </Modal>
        </Fragment>
    );
}