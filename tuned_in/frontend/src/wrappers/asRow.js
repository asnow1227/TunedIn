import React from "react";
import { Row } from '../components/Layout';

export const asRow = (Component) => {
  const Wrapper = (props) => {

    return (
        <Row align="center">
            <Component {...props}/>
        </Row>
    );
 };

  return Wrapper;
};