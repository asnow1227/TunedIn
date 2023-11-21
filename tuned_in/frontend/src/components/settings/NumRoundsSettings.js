import React, { Fragment, useRef, useState } from 'react';
import { useLocalSettingsContext } from '../../providers/LocalSettingsProvider';
import { TogglableWithAdditionIcons } from '../shared/ToggableComponent';
import { Typography, Grid, Box } from '@mui/material';
  

export default function NumRoundsSettings() {
    const { localSettingsRef, setLocalSettingsRef } = useLocalSettingsContext();
    const [currentValue, setCurrentValue] = useState(localSettingsRef.current.numRounds);

    setLocalSettingsRef({ numRounds: currentValue });

    return (
      <Fragment >
        <Box sx={{width: "50%", align: "left"}} />
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant='h6'>
                { `Number of Rounds:` }
              </Typography>
              <Typography 
                variant='subtitle1' 
                sx={(theme) => (
                {
                  color: "#b3b3b3"
                }
              )}
              >
                We recommend 3 for groups of 5 or less and 2 for any larger. 
              </Typography>
            </Grid>
            <Grid item xs={10} lg={4}>
              <TogglableWithAdditionIcons 
                onLeftIcon={() => setCurrentValue(prev => prev - 1)}
                onRightIcon={() => setCurrentValue(prev => prev + 1)}
                displayRightIcon={currentValue <= 4}
                displayLeftIcon={currentValue >= 2}
              >
                { currentValue }
              </TogglableWithAdditionIcons>
            </Grid>
          </Grid>
        <Box sx={{width: "50%"}} />
      </Fragment>
    );
  }