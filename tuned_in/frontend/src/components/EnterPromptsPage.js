import React from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Grid, Typography } from "@material-ui/core";


export default class CreatePromptsPage extends React.Component {

  num_prompts = 4; 

  constructor(props) {
    super(props)
    this.state = { 
        formValues: Array.apply(null, Array(this.num_prompts)).map(function(){
           return { text: ""}
        })
    };
    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleSubmit(event) {
    event.preventDefault();
    alert(JSON.stringify(this.state.formValues));
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
                  label={"Prompt" + index + 1}
                  placeholder="Enter a Prompt"
                  value={element.text}
                  variant="outlined"
                  onChange={e => this.handleChange(index, e)}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={this.handleSubmit}>
              Submit Prompts
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