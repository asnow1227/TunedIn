import React, { Fragment, useState } from "react";
import { Button, ButtonGroup, Typography, Box, Grid, TextField } from '@mui/material';
import { Footer } from "../components/Layout";
import { Row} from "../components/Layout"
import PlayerCard from "../components/PlayerCard";
import ToggableComponent from "../components/ToggableComponent";
import makeArray from "../utils/makeArray";
import ConditionalButton from "../components/ConditionalButton";
import API from "../backend/API";
import Divider from '@mui/material/Divider';
import RoomHeader from "../components/RoomHeader";

const ENABLED_MESSAGE = "Submit your prompts. Once submitted, prompts are final.";
const DISABLED_MESSAGE = "Please ensure no prompts are blank before submitting";

const QueueBox = ({sx=null, children, ...props}) => {
    let _sx = {width: { xs: "100%", md: "75%", lg: "50%"}};
    if (sx){
        _sx = {..._sx, ...props.sx}
    };
    return (
        <Box sx={_sx} {...props}>
            { children }
        </Box>
    )
}

const ContentDivider = ({ children }) => {
    return (
        <Divider sx={
            (theme) => ({
                "&::before, &::after": {
                    borderColor: theme.palette.secondary.main,
                },
                marginBottom: "30px", 
                marginTop:"30px"
            })} 
            orientation="horizontal"
        >
            { children }
        </Divider>
    )
}

function QueuePage(props){
    const [formValues, setFormValues] = useState(makeArray(3).map((_, i) => {return {key: i, text: "", submitted: false}}));
    const [currIndex, setCurrIndex] = useState(0);
    const anyBlank = formValues.some((elem) => !elem.text);

    const handleChange = (e) => {
        let formVals = formValues;
        formVals[currIndex].text = e.target.value;
        setFormValues([...formVals]);
    };
    
    const submitPrompts = async () => {
        let prompts = formValues.map((elem, idx) => {
            return {text: elem.text, key: idx}
        });
        try {
            await API.post('submit-prompts', prompts);
            props.setUserReady();
        } catch (error){
            alert("Error Submitting Prompt");
            console.log(error);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        submitPrompts();
    }

    const readyButton = () => {
        return (
            <ConditionalButton enabledMessage={ENABLED_MESSAGE} disabledMessage={DISABLED_MESSAGE} disabled={anyBlank}>
                <Button
                variant="contained" 
                color="secondary" 
                onClick={handleSubmit} 
                sx={(theme) => ({
                    maxWidth: '100px',
                    maxHeight: '40px', 
                    minWidth: '100px', 
                    minHeight: '40px',
                    "&.Mui-disabled": {
                        background: theme.palette.secondary.main,
                        opacity: .6
                    },
                    marginTop: "10px", 
                    marginBottom: "10px"
                })}
                disabled={anyBlank}
                > 
                    Ready
                </Button>
            </ConditionalButton>
        )
    };

    return (
    <Fragment>
        <Row>
            <Typography variant="h3">
                Lobby
            </Typography>
            <Typography variant="subtitle2">
                {`Code: ${props.roomCode}`}
            </Typography>
            <QueueBox sx={{marginTop: "30px", marginBottom: "30px"}}>
                <ContentDivider>Enter your prompts:</ContentDivider>
            </QueueBox>
            <QueueBox>
                <ToggableComponent 
                onLeftIcon={() => setCurrIndex(currIndex - 1)} 
                displayLeftIcon={currIndex != 0}
                onRightIcon={() => setCurrIndex(currIndex + 1)}
                displayRightIcon={currIndex != 2}
                >
                    <TextField
                    placeholder="Enter a Prompt"
                    value={formValues[currIndex].text}
                    variant="outlined"
                    onChange={e => handleChange(e)}
                    sx={{width: "100%"}}
                    />
                </ToggableComponent>
            </QueueBox>
            <QueueBox>
                <ContentDivider>Current Players:</ContentDivider>
                <Grid container spacing={1}>
                    {props.players.map((alias, i) => {
                        return (
                            <Fragment key={i}>
                                <Grid item xs={12} md={6} lg={6}>
                                    <PlayerCard alias={alias} avatarUrl={props.avatarUrl} score={0}/>
                                </Grid>
                            </Fragment>
                        )
                    })}
                </Grid>
            </QueueBox>
        </Row>
        <Footer>
            { readyButton() }
        </Footer>
    </Fragment>
    )
}

export default QueuePage;