import { useState } from "react";

export default function useObjectState(obj){
    const [_obj, _setObj] = useState(obj);
    const setObj = (newAttrs) => {
        _setObj((prevState) => ({...prevState, ...newAttrs}));
    };
    return [_obj, setObj];
};