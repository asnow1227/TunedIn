import React from "react"

export default function HomePageBody({ children }){
    return (
        <div className="row outer">
          <div className="row inner">
            { children }
          </div>
        </div>
    )
};