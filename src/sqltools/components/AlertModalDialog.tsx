import React from 'react';
import { Dialog } from '@mui/material';
import {AlertForm} from './AlertForm'
import { alertType } from '../models';

interface Props {
    open: boolean;
    handleClose: () => void;
    name: string,
    type: alertType
}

export const AlertModalDialog: React.FunctionComponent<Props> = (props: Props) => {
    const { open, handleClose, name, type } = props
    return (
        <Dialog open={open} onClose={handleClose}>
            <AlertForm handleClose={handleClose} name={name} type={type}/>
        </Dialog>
    );
};
