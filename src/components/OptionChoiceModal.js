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
    const isSurfaceConfigurationMode = useSelector(selectSurfaceConfigurationMode)

    return (
        <div id="control-choice-modal">
            <div className="control-choice-content">
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("animation"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Animation</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("color"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}
                >Color</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("category"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Element Category</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("surfaceConfiguration"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Surface Configuration</div>
                <div className="control-choice" style={{color: isSurfaceConfigurationMode ? "gray" : "black"}} onClick={() => {
                    if (isSurfaceConfigurationMode === false) {
                        dispatch(toggleOptionChoiceModalDisplay());
                        dispatch(addTextureControls())
                        dispatch(setSurfaceConfigurationMode(true))
                    }
                }}>Texture Configuration</div>
                <div className="control-choice" onClick={() => {
                    dispatch(createControl("toggle"));
                    dispatch(toggleOptionChoiceModalDisplay());
                }}>Toggle</div>
            </div>
        </div>
    )
}

export default OptionChoiceModal;
