import React from "react";

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
    formValues[i][e.target.name] = e.target.value;
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
        <form  onSubmit={this.handleSubmit}>
          {this.state.formValues.map((element, index) => (
            <div className="form-inline" key={index}>
              <label>Prompt {index + 1}</label>
              <input type="text" name="text" value={element.text || ""} onChange={e => this.handleChange(index, e)} />
            </div>
          ))}
          <div className="button-section">
              {/* <button className="button add" type="button" onClick={() => this.addFormFields()}>Add</button> */}
              <button className="button submit" type="submit">Submit</button>
          </div>
      </form>
    );
  }
}