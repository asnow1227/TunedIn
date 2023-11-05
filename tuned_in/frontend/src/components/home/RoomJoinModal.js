import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import RoomJoinComponent from './RoomJoinComponent';

export default function RoomJoinModal({ joinType, onClose }){
    return  (
    <Modal
        open={!!joinType}
        onClose={onClose}
        color="primary"
        >
        <ModalDialog variant='solid' color="primary">
            <ModalClose />
            <RoomJoinComponent join={joinType === 'join'} />
        </ModalDialog>
    </Modal>
    )
}