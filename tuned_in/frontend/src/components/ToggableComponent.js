import React, { Fragment } from "react";
import { Grid, IconButton } from "@material-ui/core";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

export default function ToggableComponent(props){
    return (
        <Fragment>
            <Grid container spacing={1} align="center">
                <Grid item xs={2}>
                    {
                        props.displayLeftIcon && 
                        <IconButton onClick={props.onLeftIcon}>
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
                        <IconButton onClick={props.onRightIcon}>
                            <NavigateNextIcon />
                        </IconButton>
                    }
                </Grid>
            </Grid>
        </Fragment>
    )
}