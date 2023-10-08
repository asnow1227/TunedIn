import React from "react";
import { useTheme } from "@material-ui/core/styles";

export const withTheme = (Component) => {
    const Wrapper = (props) => {
        const theme = useTheme();
    
        return (
          <Component theme={theme} {...props}/>
        );
     };

      return Wrapper;
    };
}