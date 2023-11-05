import React from "react";
import Avatar from "@mui/joy/Avatar";
import useWindowDimensions from "../../hooks/useWindowSize";

export default function HomePageHeader({ spotifyAvatarUrl }) {
    const { width } = useWindowDimensions();
    const avatarSize = Math.max(Math.floor(width/15), '30')
   
    return (
        <div className="menu">
            <Avatar src={spotifyAvatarUrl} sx={{'--Avatar-size': `${avatarSize}px`}}/>
        </div>
    )
};