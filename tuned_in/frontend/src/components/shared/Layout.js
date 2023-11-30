import React from "react";

export function Header({ children, ...childProps }){
    return (
    <div className="row header" align="center" {...childProps}>
        {children}
    </div>
    );
};

export function Footer({ children, ...childProps }){
    return (
        <div className="row footer" align="center" {...childProps}>
            {children}
        </div>
    );
};

export function Row({ children, ...childProps }){
    return (
        <div id="scrollableDiv" className="row content" align="center" {...childProps}>
            {children}
        </div>
    );
};

export function MainBox({ children, ...childProps }){
    return (
        <div className="box" align="center" {...childProps}>
            {children}
        </div>
    )
}

export function Centered({ children, ...childProps}){
    return (
        <div className="center" {...childProps}>
            {children}
        </div>
    )
}

export const flexBoxProps = {
    width: { 
        xs: "70%", 
        md: "75%", 
        lg: "50%"
    }
};