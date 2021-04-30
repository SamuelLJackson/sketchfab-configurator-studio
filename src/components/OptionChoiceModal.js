import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    createControl, 
    toggleOptionChoiceModalDisplay,
    selectSurfaceConfigurationMode,
    setSurfaceConfigurationMode,
    addTextureControls,
} from './viewerSlice';

const OptionChoiceModal = () => {
    const dispatch = useDispatch();
    const isSurfaceConfigurationMode = false //useSelector(selectSurfaceConfigurationMode)

    return (
        <div id="control-choice-modal">
            <div className="control-choice-content">
                <div 
                    className="control-choice" 
                    style={{color: "red"}}
                    onClick={() => {
                        dispatch(createControl("animation"));
                        dispatch(toggleOptionChoiceModalDisplay());
                    }}
                >Animation</div>
                <div 
                    className="control-choice" 
                    style={{color: "yellow"}}
                    onClick={() => {
                        dispatch(createControl("color"));
                        dispatch(toggleOptionChoiceModalDisplay());
                    }}
                >Color</div>
                <div 
                    className="control-choice" 
                    style={{color: "blue"}}
                    onClick={() => {
                        dispatch(createControl("geometryCategory"));
                        dispatch(toggleOptionChoiceModalDisplay());
                    }}
                >Geometry Category</div>
                <div 
                    className="control-choice" 
                    style={{visibility: isSurfaceConfigurationMode ? "hidden" : "visible", color: "green"}}
                    onClick={() => {
                        if (isSurfaceConfigurationMode === false) {
                            dispatch(toggleOptionChoiceModalDisplay());
                            dispatch(addTextureControls())
                            dispatch(setSurfaceConfigurationMode(true))
                        }
                    }}
                >Texture Configuration</div>
                <div 
                    className="control-choice" 
                    style={{color: "purple"}}
                    onClick={() => {
                        dispatch(createControl("toggle"));
                        dispatch(toggleOptionChoiceModalDisplay());
                    }}
                >Toggle</div>
            </div>
        </div>
    )
}

export default OptionChoiceModal;
