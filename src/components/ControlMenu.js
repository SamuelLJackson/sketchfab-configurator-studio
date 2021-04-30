import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    setViewMode,
    selectViewMode,
    selectDisableButtons,
} from './viewerSlice';
import OptionPanel from './OptionPanel';
import NodePanel from './NodePanel';
import ModelPanel from './ModelPanel';

const ControlMenu = () => {
    const dispatch = useDispatch();
    const viewMode = useSelector(selectViewMode);
    const disableButtons = useSelector(selectDisableButtons);

    let nodesButtonStyles = {
        backgroundColor: viewMode === "nodes" ? "white" : "gray"
    }

    let optionsButtonStyles = {
        backgroundColor: viewMode === "options" ? "white" : "gray"
    }

    let modelButtonStyles = {
        backgroundColor: viewMode === "model" ? "white" : "gray"
    }

    const renderPanel = (viewMode) => {
        if (viewMode === "options") {
            return <OptionPanel />
        } else if (viewMode === "nodes") {
            return <NodePanel />
        } else if (viewMode === "model") {
            return <ModelPanel />
        }
    }

    return (
        <div className="control-menu">
            <div style={{display: "flex"}}>
                <button 
                    className="control-menu__button"
                    style={nodesButtonStyles}
                    disabled={disableButtons}
                    onClick={() => dispatch(setViewMode("nodes"))}
                >Nodes</button>
                <button 
                    className="control-menu__button"
                    style={optionsButtonStyles}
                    disabled={disableButtons}
                    onClick={() => dispatch(setViewMode("options"))}
                >Options</button>
                <button 
                    className="control-menu__button"
                    style={modelButtonStyles}
                    onClick={() => dispatch(setViewMode("model"))}
                >Model</button>
            </div>
            {renderPanel(viewMode)}
        </div>
    )
}

export default ControlMenu;
