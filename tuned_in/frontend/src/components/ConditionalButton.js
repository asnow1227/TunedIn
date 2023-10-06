import React from "react";
import { Tooltip, Button } from "@material-ui/core";

export default function ConditionalButton(props){
    const enabledMessage = props.enabledMessage ? props.enabledMessage : '';
    const disabledMessage = props.disabledMessage ? props.disabledMessage : '';
    const message = props.disabled ? disabledMessage : enabledMessage
    return (
        <Tooltip disableFocusListener disableTouchListener title={message}>
            <span>
                <Button 
                    {...props.buttonProps}
                    disabled={props.disabled} 
                >
                    {props.buttonText}
                </Button>
            </span>
        </Tooltip>
    )
}