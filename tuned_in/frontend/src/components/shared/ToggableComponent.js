import React, { Fragment } from "react";
import { Grid, IconButton } from "@mui/material";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function ToggableComponent({ LeftIcon, RightIcon, ...props }){
    console.log(props.displayLeftIcon, props.displayLeftIcon);
    return (
        <Fragment>
            <Grid container spacing={0} align="center" alignItems="center">
                <Grid item xs={2}>
                    {
                        props.displayLeftIcon && 
                        <IconButton onClick={props.onLeftIcon} color="secondary">
                            <LeftIcon />
                        </IconButton>
                    }
                </Grid>
                <Grid item xs={8}>
                    { props.children }
                </Grid>
                <Grid item xs={2}>
                    {
                        props.displayRightIcon && 
                        <IconButton onClick={props.onRightIcon} color="secondary">
                            <RightIcon />
                        </IconButton>
                    }
                </Grid>
            </Grid>
        </Fragment>
    )
}


export function TogglableWithNavigateIcons({ children, ...props }){
    return <ToggableComponent LeftIcon={NavigateBeforeIcon} RightIcon={NavigateNextIcon} {...props}>
        { children }
    </ToggableComponent>
}



export function TogglableWithAdditionIcons({ children, ...props }){
    return <ToggableComponent LeftIcon={RemoveIcon} RightIcon={AddIcon} {...props}>
        { children }
    </ToggableComponent>
}