import React, { Fragment, useRef, useState } from 'react';
import { useLocalSettingsContext } from '../../providers/LocalSettingsProvider';
import { TogglableWithAdditionIcons } from '../shared/ToggableComponent';
import { Typography } from '@mui/material';
import Slider from '@mui/material/Slider';
  

export default function NumRoundsSettings() {
    const { localSettings, setLocalSettings } = useLocalSettingsContext();
    const [currentValue, setCurrentValue] = useState()

    const setNewValue = (event, newValue) => {
      setLocalSettings((prev) => ({...prev, numRounds: newValue}));
    };

    return (
      <Fragment >
        <Typography variant='h6'>
          { `Number of Rounds:` }
        </Typography>
        <TogglableWithAdditionIcons />

      </Fragment>
    );
  }