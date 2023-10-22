import React, { Fragment, useState } from "react";
import API from "../backend/API";
import { TextField, Grid, Typography } from "@mui/material";
import ConditionalButton from "../components/ConditionalButton";
import ToggableComponent from "../components/ToggableComponent";
import makeArray from "../utils/makeArray";
import { Centered, Row, Header, Footer } from "../components/Layout";

const ENABLED_MESSAGE = "Submit your prompts. Once submitted, prompts are final.";
const DISABLED_MESSAGE = "Please ensure no prompts are blank before submitting";

export default function CreatePromptsPage(props) {
  const [formValues, setFormValues] = useState(makeArray(3).map((_, i) => {return {key: i, text: "", submitted: false}}));
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

  const buttonProps = { variant: "contained", color: "secondary", onClick: handleSubmitButtonPressed }

  return (
    <Fragment>
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
      {/* <ConditionalButton 
        // disabled={anyBlank} 
        buttonProps={buttonProps} 
        enabledMessage={ENABLED_MESSAGE}
        disabledMessage={DISABLED_MESSAGE}
        buttonText="Submit"
      /> */}
    </Fragment>
  );
}


