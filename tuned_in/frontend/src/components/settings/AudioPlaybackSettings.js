import React, { useState, Fragment } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useLocalSettingsContext } from '../../providers/LocalSettingsProvider';
import { useUserContext } from '../../providers/UserContext';
import { Typography } from '@mui/material';


export default function AudioPlaybackSettings() {
    const { localSettingsRef } = useLocalSettingsContext();
    const { user } = useUserContext();
    const [playbackType, setPlaybackType] = useState(localSettingsRef.hostDeviceOnly ? "host" : "local");
    console.log(localSettingsRef);

    const handleClick = (e) => {
        setPlaybackType(e.target.value);
        localSettingsRef.current = {...localSettingsRef.current, hostDeviceOnly: e.target.value == "host"};
    };
    
    return (
      <Fragment >
        <Typography variant='h6'>
          Audio Playback
        </Typography>
        <FormControl sx={{color: "white"}}>
          {/* <FormLabel id="demo-row-radio-buttons-group-label" sx={{ color: "white", '&$focused': {color: "white"}}}>Audio Options</FormLabel> */}
          <RadioGroup
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={playbackType}
            onChange={handleClick}
          >
            <FormControlLabel value="host" disabled={!user.isAuthenticated} control={<Radio sx={(theme) => ({ 
                '&, &.Mui-checked': { 
                  color: theme.palette.secondary.main
                }
              })} />} label="Only play audio through host device" />
            <FormControlLabel value="local" control={<Radio sx={(theme) => ({ 
                '&, &.Mui-checked': { 
                  color: theme.palette.secondary.main
                }
              })} />} label="Allow users to play audio locally" />
          </RadioGroup>
        </FormControl>
      </Fragment>
    );
  }