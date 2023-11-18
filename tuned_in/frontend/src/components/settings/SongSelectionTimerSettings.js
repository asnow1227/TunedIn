import React, { Fragment, useRef, useState } from 'react';
import { useLocalSettingsContext } from '../../providers/LocalSettingsProvider';
import { Typography } from '@mui/material';
import Slider from '@mui/material/Slider';


export default function SongSelectionTimerSettings() {
    const { localSettingsRef } = useLocalSettingsContext();
    const [userSelectionTimer, setUserSelectionTimer] = useState(localSettingsRef.current.songSelectionTimer);

    const setNewValue = (event, newValue) => {
      setUserSelectionTimer(newValue);
      localSettingsRef.current = {...localSettingsRef.current, songSelectionTimer: newValue }
    };

    return (
      <Fragment >
        <Typography variant='h6'>
          { `Selection Timer: ${userSelectionTimer}s` }
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