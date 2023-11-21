import React from "react";
import { Tooltip } from "@mui/material";

export default function ConditionalButton({ children, ...props }){
    const enabledMessage = props.enabledMessage ? props.enabledMessage : '';
    const disabledMessage = props.disabledMessage ? props.disabledMessage : '';
    const message = props.disabled ? disabledMessage : enabledMessage
    return (
        <Tooltip disableFocusListener disableTouchListener title={message}>
            <span>
                {children}
            </span>
        </Tooltip>
    )
}