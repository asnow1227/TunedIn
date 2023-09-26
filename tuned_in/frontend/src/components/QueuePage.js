import React from "react";
import { Button, Typography } from '@material-ui/core';


export default function QueuePage(props){
    return (
        <div align="center">
            <Typography variant="h3" component="h3">
                Queue 
            </Typography>
            {props.players.map(function(alias, i){
                return (
                    <div key={i}>
                        <Typography variant="h4" component="h4">
                            {alias}
                        </Typography>
                    </div>
                )
            })}
            {
                props.isHost && 
                <Button variant="contained" color="primary" onClick={() => props.setUserReady()}> 
                    Ready
                </Button>
            }
        </div>
    )
}