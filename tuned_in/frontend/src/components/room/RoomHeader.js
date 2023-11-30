import React from "react";
import RoomMenu from "./RoomMenu";
import { Header } from "../shared/Layout";


export default function RoomHeader({ children, ...props }){
    return (
        <Header {...props}>
            <RoomMenu />
            { children }
        </Header>
    )
};