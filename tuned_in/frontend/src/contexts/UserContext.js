import React, { createContext, useContext } from "react";

const UserContext = createContext(undefined);
export default UserContext;

export function useUserContext(){
    const userContext = useContext(UserContext);
    if (userContext === undefined){
        throw Error("useUserContext requires UserContext Provider");
    }
    return userContext;
}