import React, { Fragment } from "react";
import { Grid, IconButton } from "@mui/material";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function ToggableComponent(props){
    return (
        <Fragment>
            <Grid container spacing={0} align="center">
                <Grid item xs={2}>
                    {
                        props.displayLeftIcon && 
                        <IconButton onClick={props.onLeftIcon} color="secondary">
                            <NavigateBeforeIcon />
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
                            <NavigateNextIcon />
                        </IconButton>
                    }
                </Grid>
            </Grid>
        </Fragment>
    )
}