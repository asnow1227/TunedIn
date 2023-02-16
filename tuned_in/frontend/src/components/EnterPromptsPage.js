import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Grid, Typography, ButtonGroup, ListItemText, IconButton } from "@material-ui/core";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const makeArray = (num_prompts) => {
  return Array.apply(null, Array(num_prompts)).map(function(e, i) {
    return { 
      key: i, 
      text: "",
      submitted: false,
    }
  });
};

export default function CreatePromptsPage(props) {
  const [numPrompts, setNumPrompts] = useState(4);
  const [formValues, setFormValues] = useState(makeArray(4));
  const [currIndex, setCurrIndex] = useState(0);

  const handleChange = (e) => {
    let formVals = formValues;
    formVals[currIndex].text = e.target.value;
    setFormValues([...formVals]);
  }

  const submitPrompt = async (formVals, index) => {
    if (formVals[index] == ""){
      alert("Prompt Cannot be Blank");
      return
    }
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt_text: formVals[index].text,
        prompt_key: formVals[index].key,
      })
    };
    const response = await fetch('/api/submit-prompt', requestOptions);
    if (!response.ok){
      alert("Error Submitting Prompt")
      return
    }
    formVals[index].submitted = true;
    setFormValues([...formVals]);
  };

  const unsubmitPrompt = async (formVals, index) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt_key: formVals[index].key,
      })
    };
    const response = await fetch('/api/delete-prompt', requestOptions);
    if (!response.ok) {
      alert("Unable to delete prompt sucessfully")
      return
    }
    formVals[index].submitted = false;
    setFormValues([...formVals]);
  }

  const handleSubmitButtonPressed = async (e) => {
    e.preventDefault();
    let formVals = formValues;
    let index = currIndex
    if (formVals[currIndex].submitted){
      unsubmitPrompt(formVals, index);
    } else {
      submitPrompt(formVals, index);
    }
    console.log(formValues[currIndex]);
  }

  const submitAll = () => {
    let anyBlank = false;
    let formVals = formValues;
    for (let i=0; i < formVals.length; i++) {
      if (formVals[i].text == ""){
        anyBlank = true;
        break;
      }
    };
    if (anyBlank) {
      alert("No Prompts can be Blank");
      return
    }
    for (let i=0; i < formVals.length; i++) {
      if (!formValues[i].submitted){
        submitPrompt(formVals, i);
      }
    };
  };

  const unsubmitAll = () => {
    let formVals = formValues;
    for (let i=0; i < formVals.length; i++) {
      if (formVals[i].submitted){
        unsubmitPrompt(formVals, i);
      };
    };
  }

  return (
    <div>
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <Typography variant="h4" component="h4">
            Enter Prompts
          </Typography>
        </Grid>
        <Grid item xs={2}>
          {
            currIndex == 0 ? null : 
            <IconButton onClick={() => {
              setCurrIndex(currIndex - 1);
            }}>
              <NavigateBeforeIcon />
            </IconButton>
          }
        </Grid>
        <Grid item xs={8}>
          <TextField
              label={"Prompt " + String(currIndex + 1)}
              placeholder="Enter a Prompt"
              value={formValues[currIndex].text}
              multiline="true"
              variant="outlined"
              onChange={e => handleChange(e)}
          />
        </Grid>
        <Grid item xs={2}>
          {
            currIndex == numPrompts - 1 ? null : 
            <IconButton onClick={() => {
              setCurrIndex(currIndex + 1);
            }}>
              <NavigateNextIcon />
            </IconButton>
          }
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color={!formValues[currIndex].submitted ? "primary" : "secondary"} onClick={handleSubmitButtonPressed}>
            {formValues[currIndex].submitted ? "Unsubmit" : "Submit"}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" onClick={submitAll}>
              Submit All
            </Button>
            <Button color="secondary" onClick={unsubmitAll}>
              Unsubmit All
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </div>
  );
}


