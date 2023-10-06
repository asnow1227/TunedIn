import React, { Fragment, useState } from "react";
import API from "../backend/API";
import { TextField, Grid, Typography } from "@material-ui/core";
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

  const buttonProps = { variant: "contained", color: "primary", onClick: handleSubmitButtonPressed }

  return (
    <Fragment>
      <Header align="center">
        <Typography variant="h4" component="h4">
          Enter Prompts
        </Typography>
      </Header>
      <Row>
        <Centered>
          <ToggableComponent 
            onLeftIcon={() => setCurrIndex(currIndex - 1)} 
            displayLeftIcon={currIndex != 0}
            onRightIcon={() => setCurrIndex(currIndex + 1)}
            displayRightIcon={currIndex != 2}
          >
            <TextField
              label={"Prompt " + String(currIndex + 1)}
              placeholder="Enter a Prompt"
              value={formValues[currIndex].text}
              multiline={true}
              variant="outlined"
              onChange={e => handleChange(e)}
            />
          </ToggableComponent>
        </Centered>
      </Row>
      <Footer>
        <ConditionalButton 
          disabled={anyBlank} 
          buttonProps={buttonProps} 
          enabledMessage={ENABLED_MESSAGE}
          disabledMessage={DISABLED_MESSAGE}
          buttonText="Submit"
        />
      </Footer>
    </Fragment>
  );
}


