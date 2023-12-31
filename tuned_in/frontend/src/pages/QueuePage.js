import React, { Fragment, useState } from "react";
import { Button, Typography, Box, TextField } from '@mui/material';
import { Footer } from "../components/shared/Layout";
import { Row} from "../components/shared/Layout"
import makeArray from "../utils/makeArray";
import ConditionalButton from "../components/shared/ConditionalButton";
import API from "../backend/API";
import Divider from '@mui/material/Divider';
import PlayerFeed from "../components/players/PlayerFeed";
import { useParams } from "react-router-dom";
import { usePlayersContext } from "../providers/PlayersContext";
import { TogglableWithNavigateIcons } from "../components/shared/ToggableComponent";
import { useGlobalSettingsContext } from "../providers/GlobalSettingsProvider";
import { useUserContext } from "../providers/UserContext";
import useUserReady from "../hooks/useUserReady";
import RoomHeader from "../components/room/RoomHeader";

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
    const { settings } = useGlobalSettingsContext();
    const [formValues, setFormValues] = useState(makeArray(settings.numRounds).map((_, i) => {return {key: i, text: "", submitted: false}}));
    const [currIndex, setCurrIndex] = useState(0);
    const { roomCode } = useParams();
    const players = usePlayersContext();
    const setUserReady = useUserReady();
    const { user } = useUserContext();
    const anyBlank = formValues.some((elem) => !elem.text);
    const playerNotReady = (user.isHost && players.filter(player => player.id != user.id).some(player => !player.isReady));

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
            setUserReady();
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
            <ConditionalButton enabledMessage={ENABLED_MESSAGE} disabledMessage={DISABLED_MESSAGE} disabled={anyBlank || playerNotReady}>
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
                disabled={anyBlank || playerNotReady}
                > 
                    Ready
                </Button>
            </ConditionalButton>
        )
    };

    return (
    <Fragment>
        <RoomHeader />
        <Row>
            <Typography variant="h3">
                Lobby
            </Typography>
            <Typography variant="subtitle2">
                {`Code: ${roomCode}`}
            </Typography>
            <QueueBox sx={{marginTop: "30px", marginBottom: "30px"}}>
                <ContentDivider>Enter your prompts:</ContentDivider>
            </QueueBox>
            <QueueBox>
                <TogglableWithNavigateIcons
                onLeftIcon={() => setCurrIndex(currIndex - 1)} 
                displayLeftIcon={currIndex >= 1}
                onRightIcon={() => setCurrIndex(currIndex + 1)}
                displayRightIcon={currIndex <= formValues.length - 2}
                >
                    <TextField
                    placeholder="Enter a Prompt"
                    value={formValues[currIndex].text}
                    variant="outlined"
                    onChange={e => handleChange(e)}
                    sx={{width: "100%"}}
                    />
                </TogglableWithNavigateIcons>
            </QueueBox>
            <QueueBox>
                <ContentDivider>Current Players:</ContentDivider>
                <PlayerFeed players={players} />
            </QueueBox>
        </Row>
        <Footer>
            { readyButton() }
        </Footer>
    </Fragment>
    )
}

export default QueuePage;