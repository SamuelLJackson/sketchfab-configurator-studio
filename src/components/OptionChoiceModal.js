import React from 'react';
import { useDispatch } from 'react-redux';
import { createControl, toggleOptionChoiceModalDisplay } from './viewerSlice';

export default () => {
    const dispatch = useDispatch();

    return (
        <div id="control-choice-modal">
            <div className="control-choice-content">
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("color"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}
                >Color</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("toggle"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Toggle</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("grouping"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Grouping</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("animation"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Animation</div>
            </div>
        </div>
    )
}
