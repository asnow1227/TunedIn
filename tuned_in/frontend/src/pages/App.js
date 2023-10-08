import React from "react";
// import { render } from "react-dom";
import ReactDOM from "react-dom/client";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import HomePage from "./HomePage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#191414",
      contrastText: "white"
    },
    secondary: {
      main: "#1DB954",
      contrastText: "white"
    }
  },
  typography: {
    fontFamily: "Circular",
  },
});

// export default function App(props){
//   console.log(theme);
//   return (
//     <MuiThemeProvider theme={theme}>
//        <HomePage />
//     </MuiThemeProvider>
//   )
// }

const appDiv = ReactDOM.createRoot(document.getElementById("app"));
appDiv.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
       <HomePage />
    </MuiThemeProvider>
  </React.StrictMode>
);

// const appDiv = document.getElementById("app");
// render(<App />, appDiv);