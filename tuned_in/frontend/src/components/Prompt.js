import React, { useState, useCallback, useEffect } from "react";

export default function Prompt(props) {
    const[prmpt, setPrmpt] = useState('');
    useEffect(() => {
        const setUp = async () => {
            const response = await fetch('/api/prompt');
            if (!response.ok){
                return
            }
            const data = await response.json();
            setPrmpt(data.prompt)
        }
        setUp();
    })
    return (
        <div>{prmpt}</div>
    )
}