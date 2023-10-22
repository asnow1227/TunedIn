import React from "react";
import ReactDOM from "react-dom/client";
import { experimental_extendTheme as materialExtendTheme, Experimental_CssVarsProvider as MaterialCssVarsProvider, THEME_ID as MATERIAL_THEME_ID } from "@mui/material/styles";
import { CssVarsProvider as JoyCssVarsProvider, extendTheme as JoyExtendTheme, THEME_ID as JOY_THEME_ID } from "@mui/joy/styles";
import HomePage from "./HomePage";


export const SPOTIFY_BLACK = "#191414"
export const SPOTIFY_GREEN = "#1DB954"

let materialTheme = materialExtendTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          borderColor: SPOTIFY_BLACK,
          borderRadius: "4px",
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          borderColor: SPOTIFY_BLACK,
          '&.Mui-focused': {
            borderColor: SPOTIFY_GREEN
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: SPOTIFY_GREEN,
          },
          '& .MuiOutlinedInput-root': {
            color: SPOTIFY_BLACK,
            borderRadius: "4px",
            borderWidth: '0.30rem',
            borderColor: "white",
            '&:hover fieldset': {
              borderColor: 'white',
            },
            '&.Mui-focused fieldset': {
              borderColor: SPOTIFY_GREEN
            },
          },
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        color: SPOTIFY_BLACK,
        input: {
          color: SPOTIFY_BLACK,
          borderColor: SPOTIFY_BLACK,
          borderRadius: '4px',
          backgroundColor: "white",
        },
      }
    }
  },
  palette: {
    primary: {
      main: SPOTIFY_BLACK,
      contrastText: "white"
    },
    secondary: {
      main: SPOTIFY_GREEN,
      contrastText: "black"
    },
  },
  typography: {
    fontFamily: "Circular",
  },
});

const palette = {
  primary: {
    solidBg: SPOTIFY_BLACK,
    solidBorder: SPOTIFY_BLACK,
    200: "#535353",
  },
  secondary: {
    solidBg: SPOTIFY_GREEN,
    solidBorder: SPOTIFY_GREEN,
    200: SPOTIFY_GREEN,
  }
}

const JoyTheme = JoyExtendTheme({
  colorSchemes: {
    light: { palette },
    dark: { palette },
  },
  typography: {
    fontFamily: "Circular",
  },
})

const appDiv = ReactDOM.createRoot(document.getElementById("app"));
appDiv.render(
  <React.StrictMode>
    <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider theme={{ [JOY_THEME_ID]: JoyTheme}}>
        <HomePage />
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  </React.StrictMode>
);
