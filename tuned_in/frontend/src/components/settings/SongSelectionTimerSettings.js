import React, { Fragment, useRef, useState } from 'react';
import { useLocalSettingsContext } from '../../contexts/LocalSettingsProvider';
import { Typography } from '@mui/material';
import Slider from '@mui/material/Slider';


export default function SongSelectionTimerSettings() {
    const { localSettingsRef, setLocalSettingsRef } = useLocalSettingsContext();
    const [userSelectionTimer, setUserSelectionTimer] = useState(localSettingsRef.current.songSelectionTimer);

    const setNewValue = (event, newValue) => {
      setUserSelectionTimer(newValue);
      setLocalSettingsRef({ songSelectionTimer: newValue });
    };

    return (
      <Fragment >
        <Typography variant='h6'>
          { `Selection Timer: ${userSelectionTimer}s` }
        </Typography>
        <Typography 
          variant='subtitle1' 
          sx={(theme) => (
          {
            color: "#b3b3b3"
          }
        )}
        >
          Controls the alloted time for the song selection phase. (2 songs are selected during this phase)
        </Typography>
        <Slider 
        color='secondary'
        step={10} 
        marks 
        min={30} 
        max={200} 
        value={userSelectionTimer}
        onChange={setNewValue}
        />
      </Fragment>
    );
  }