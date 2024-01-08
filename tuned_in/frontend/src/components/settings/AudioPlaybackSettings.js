import React, { useState, Fragment } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { useLocalSettingsContext } from '../../contexts/LocalSettingsProvider';
import { useUserContext } from '../../contexts/UserContext';
import { Typography } from '@mui/material';
import ConditionalButton from '../shared/ConditionalButton';


export default function AudioPlaybackSettings() {
    const { localSettingsRef, setLocalSettingsRef } = useLocalSettingsContext();
    const { user } = useUserContext();
    const [playbackType, setPlaybackType] = useState(localSettingsRef.hostDeviceOnly ? "host" : "local");
    console.log(user.isAuthenticated);

    const handleClick = (e) => {
      if (!e.target.value) return;
      setPlaybackType(e.target.value);
      setLocalSettingsRef({ hostDeviceOnly: e.target.value == "host"});
    };
    
    return (
      <Fragment >
        <Typography variant='h6'>
          Audio Playback
        </Typography>
        <FormControl sx={{color: "white"}}>
          <RadioGroup
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={playbackType}
            onChange={handleClick}
          >
            <FormControlLabel 
              value="host" 
              sx={(theme) => ({ 
                  '.MuiFormControlLabel-label': {
                    '&.Mui-disabled': {
                      color: theme.palette.primary.alternative,
                    }
                  },
                  '.MuiRadio-colorPrimary': {
                    '&.Mui-disabled': {
                      color: theme.palette.primary.alternative,
                    }
                  }
              })}
              control={
                // <ConditionalButton disbaledMessage="Requires login with Spotify" disabled={!user.isAuthenticated}>
                  <Radio 
                  sx={(theme) => ({ 
                    '&, &.Mui-checked': { 
                      color: theme.palette.secondary.main
                    },
                    // '&, &.Mui-disabled': {
                    //   color: theme.palette.primary.alternative
                    // }
                  })} 
                  />
              } 
              disabled={!user.isAuthenticated}
              label="Only play audio through host device" 
            />
            <FormControlLabel 
              value="local" 
              control={<Radio sx={(theme) => ({ 
                '&, &.Mui-checked': { 
                  color: theme.palette.secondary.main
                }
              })} />} 
              label="Allow users to play audio locally" 
            />
          </RadioGroup>
        </FormControl>
      </Fragment>
    );
  }