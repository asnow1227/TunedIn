import React, { useRef, useState } from "react";
import { Grid, IconButton } from "@mui/material";
import { Header } from "./Layout";
import Avatar from "@mui/joy/Avatar";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import useWindowDimensions from "../hooks/useWindowSize";

export default function RoomHeader({ children, ...props }) {
    const { width, height } = useWindowDimensions();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const avatarSize = Math.max(Math.floor(width/15), '30')

    return (
    <div className="menu">
        <Tooltip title="Room Info">
            <IconButton 
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Avatar src={props.avatarUrl} sx={{'--Avatar-size': `${avatarSize}px`}}/>
            </IconButton>
        </Tooltip>
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: (theme) => ({
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        // backgroundColor: theme.palette.primary.main,
                        // color: theme.palette.primary.contrastText,
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    }),
                }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={handleClose}>
                <ListItemIcon onClick={props.leaveButtonPressed}>
                    <Logout fontSize="small" color="secondary"/>
                </ListItemIcon>
                    End Game
                </MenuItem>
        </Menu>
    </div>
    )
}