import React from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Grid, Typography, ListItemText } from "@material-ui/core";


export default class CreatePromptsPage extends React.Component {

  num_prompts = 4; 

  constructor(props) {
    super(props)
    this.state = { 
        formValues: Array.apply(null, Array(this.num_prompts)).map(function(e, i){
           return { key: i, text: ""}
        }),
        submitted: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitButtonPressed = this.handleSubmitButtonPressed.bind(this);
    this.handleUnsubmit = this.handleUnsubmit.bind(this);
  }
  
  handleChange(i, e) {
    let formValues = this.state.formValues;
    console.log(e.target.value);
    console.log(formValues);
    formValues[i].text = e.target.value;
    console.log(formValues);
    this.setState({ formValues });
  }

  addFormFields() {
    if (this.state.formValues.length >= this.max_prompts) {
        alert("Max Prompts Has Been Achieved, Please Remove or Edit an Existing Prompt");
    }
    else {
        this.setState(({
            formValues: [...this.state.formValues, { text: "",}]
        }))
    };
  }

  removeFormFields(i) {
    let formValues = this.state.formValues;
    formValues.splice(i, 1);
    this.setState({ formValues });
  }

  handleSubmitButtonPressed(event) {
    if (this.state.submitted) {
      this.handleUnsubmit(event);
    } else {
      this.handleSubmit(event);
    }
  }

  async handleUnsubmit(event) {
    event.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    };
    await fetch('/api/delete-prompts', requestOptions)
    .then((response) => {
      if (response.ok){
        alert("Deleted Prompts for User")
        this.setState({submitted: false});
      } else {
        this.setState({submitted: true});
      }
      return response.json()
    })
    .then((data) => {
      console.log(data);
    });
  }

  async handleSubmit(event) {
    const formValues = this.state.formValues;
    var foundBlank = false;
    for (let i = 0; i < formValues.length; i++) {
      if (formValues[i].text == ""){
        foundBlank = true;
        break;
      };
    };
    if (foundBlank) {
      alert("Prompts cannot be blank");
      event.preventDefault();
    } else {
      var Ok = true;
      var lastResponse = "";
      var requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: "",
      };
      for (let i = 0; i < formValues.length; i++) {
        if (!Ok) break;

        requestOptions.body = JSON.stringify({
          prompt_text: formValues[i].text,
          prompt_key: formValues[i].key,
        });

        await fetch('/api/submit-prompt', requestOptions)
        .then((response) => {
          if (!response.ok) {
            Ok = false;
          }
          return response.json()
        })
        .then((data) => lastResponse = JSON.stringify(data))
      };
    };
    if (Ok) {
      alert("Prompts Submitted Successfully");
      this.setState({submitted: true})
    } else {
      alert(lastResponse);
      this.setState({submitted: false})
    }
    event.preventDefault();
  }

  render() {

    return (
        <Grid container spacing={1} align="center">
          <Grid item xs={12}>
            <Typography variant="h4" component="h4">
              Enter Prompts
            </Typography>
          </Grid>
          {this.state.formValues.map((element, index) => (
            <Grid item xs={12}>
              <TextField
                  label={"Prompt " + String(index + 1)}
                  placeholder="Enter a Prompt"
                  value={element.text}
                  multiline="true"
                  variant="outlined"
                  onChange={e => this.handleChange(index, e)}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={this.handleSubmitButtonPressed}>
              {this.state.submitted ? "Unsubmit" : "Submit"}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" to="/" component={Link}>
              Home
            </Button>
          </Grid>
        </Grid>
      );
    }
}

/*
<form  onSubmit={this.handleSubmit}>
          {this.state.formValues.map((element, index) => (
            <div className="form-inline" key={index}>
              <label>Prompt {index + 1}</label>
              <input type="text" name="text" value={element.text || ""} onChange={e => this.handleChange(index, e)} />
            </div>
          ))}
          <div className="button-section">
              
              <button className="button submit" type="submit">Submit</button>
          </div>
      </form>
*/