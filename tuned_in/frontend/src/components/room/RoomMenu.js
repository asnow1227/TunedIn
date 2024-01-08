import React, { useState } from "react";
import { IconButton, Typography } from "@mui/material";
import Avatar from "@mui/joy/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import Login from '@mui/icons-material/Login';
import useWindowDimensions from "../../hooks/useWindowSize";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useUserContext } from "../../contexts/UserContext";
import SettingsIcon from '@mui/icons-material/Settings';
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import useLeaveRoom from "../../hooks/useLeaveRoom";
import UpdateSettingsModal from "../settings/UpdateSettingsModal";

export default function RoomMenu({ children, ...props }) {
    const { width, height } = useWindowDimensions();
    const [anchorEl, setAnchorEl] = useState(null);
    const { toggleSpotifyAuth } = useSpotifyAuth();
    const { user } = useUserContext();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const leaveRoom = useLeaveRoom();


    const open = Boolean(anchorEl);
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const avatarSize = Math.max(Math.floor(width/15), '30');

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
                <Avatar 
                src={user.avatarUrl} 
                sx={{
                    '--Avatar-size': `${avatarSize}px`,
                    'border': user.isAuthenticated ? '2px solid blue' : '2px solid gray'
                }}/>
            </IconButton>
        </Tooltip>
        <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            // onClick={handleClose}
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
            {  
                user.isAuthenticated && 
                <MenuItem divider={true}>
                    <ListItemIcon>
                        <ListItemAvatar>
                            <Avatar src={user.image_url}/>
                        </ListItemAvatar>
                    </ListItemIcon>
                    <Typography variant="h6">
                        {user.display_name}
                    </Typography>
                </MenuItem>
            }
            <MenuItem onClick={handleClose} divider={true}>
                <ListItemIcon onClick={leaveRoom}>
                    <ExitToAppIcon fontSize="small" color="secondary"/>
                </ListItemIcon>
                { user.isHost ? "End Game" : "Leave Game"}
            </MenuItem>
            <MenuItem onClick={handleClose} divider={true}>
                <ListItemIcon onClick={toggleSpotifyAuth}>
                    {user.isAuthenticated ? <Logout fontSize="small" color="secondary"/> : <Login fontSize="small" color="secondary"/>}
                </ListItemIcon>
                {user.isAuthenticated ? "Logout of Spotify" : "Login with Spotify"}
            </MenuItem>
            {
                user.isHost && 
            <MenuItem divider={true}>
                <ListItemIcon onClick={() => setSettingsOpen(true) }>
                    <SettingsIcon color="secondary" />
                    <UpdateSettingsModal isOpen={settingsOpen} setIsOpen={setSettingsOpen}/>
                </ListItemIcon>
                Settings
            </MenuItem>
            }
        </Menu>
    </div>
    )
}