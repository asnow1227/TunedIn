import React from "react";
// import { render } from "react-dom";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
    },
  },
  components: {
    MuiInputBase: {
        styleOverrides: {
            input: {
                color: 'white',
            }
        }
    }
  },
    // action: {
    //   disabled: "white",
    //   disabledBackground: "#1DB954",
    //   disabledOpacity: .1,
    // },
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
    <ThemeProvider theme={theme}>
       <HomePage />
    </ThemeProvider>
  </React.StrictMode>
);

// const appDiv = document.getElementById("app");
// render(<App />, appDiv);