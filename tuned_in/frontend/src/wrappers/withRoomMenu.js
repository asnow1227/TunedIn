import React from "react";
import RoomMenu from "../components/room/RoomMenu";

export const withRoomMenu = (Component) => {
    const Wrapper = (props) => {
        return (
            <div>
                <RoomMenu />
                <Component {...props}/>
            </div>
        )
    };

    return Wrapper;
}