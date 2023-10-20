import React, { Fragment } from "react";
import { Button, Typography } from '@mui/material';
import { Centered, Footer } from "../components/Layout";
import { Row } from "../components/Layout"


function QueuePage(props){
    return (
        <Fragment>
            <Row>
                <Typography variant="h3" component="h3">
                    Queue 
                </Typography>
                <Typography className="loading">
                    Waiting
                </Typography>
                <Centered>
                    {props.players.map(function(alias, i){
                        return (
                        <Typography variant="h4" component="h4">
                            {alias}
                        </Typography>
                        )
                    })}
                </Centered>
            </Row>
            <Footer>
            {
                props.isHost && 
                <Button variant="contained" color="primary" onClick={() => props.setUserReady()}> 
                    Ready
                </Button>
            }
            </Footer>
        </Fragment>
    )
}

export default QueuePage;