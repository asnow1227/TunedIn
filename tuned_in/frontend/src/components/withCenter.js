import React, { Component } from "react";

export const withCenter = (Component) => {
  const Wrapper = (props) => {
    if (props.centerClass) {
        return (
            <div className="center">
                <Component
                    {...props}
                />
            </div>
        )
    }

    return (
      <Component
        {...props}
        />
    );
 };

  return Wrapper;
};