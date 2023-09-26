import React, { useState } from "react";
import API from "../backend/API";
import { TextField, Button, Grid, Typography, Tooltip, IconButton } from "@material-ui/core";
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
  const [formValues, setFormValues] = useState(makeArray(3));
  const [currIndex, setCurrIndex] = useState(0);
  const anyBlank = formValues.some((elem) => !elem.text);

  const handleChange = (e) => {
    let formVals = formValues;
    formVals[currIndex].text = e.target.value;
    setFormValues([...formVals]);
  }

  const submitPrompts = async () => {
    let prompts = formValues.map((elem, idx) => {
      return {text: elem.text, key: idx}
    });
    console.log(prompts);
    try {
      await API.post('submit-prompts', prompts);
      props.setUserReady();
    } catch (error){
      alert("Error Submitting Prompt");
    }
  };

  const handleSubmitButtonPressed = async (e) => {
    e.preventDefault();
    submitPrompts();
  }

  const buttonTitle = anyBlank ? "Please ensure no prompts are blank before submitting" : "Submit your prompts. Once submitted, prompts are final.";

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
              multiline={true}
              variant="outlined"
              onChange={e => handleChange(e)}
          />
        </Grid>
        <Grid item xs={2}>
          {
            currIndex == 2 ? null : 
            <IconButton onClick={() => {
              setCurrIndex(currIndex + 1);
            }}>
              <NavigateNextIcon />
            </IconButton>
          }
        </Grid>
        <Grid item xs={12}>
          {
            <Tooltip disableFocusListener disableTouchListener title={buttonTitle}>
              <span>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSubmitButtonPressed} 
                  disabled={anyBlank} 
                >
                  Submit
                </Button>
              </span>
            </Tooltip>
          }
        </Grid>
      </Grid>
    </div>
  );
}


