import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    setViewMode,
    selectViewMode,
    selectDisableButtons,
} from './viewerSlice';
import OptionPanel from './OptionPanel';
import NodePanel from './NodePanel';

export default () => {
    const dispatch = useDispatch();
    const viewMode = useSelector(selectViewMode);
    const disableButtons = useSelector(selectDisableButtons);

    let nodesButtonStyles = {
        backgroundColor: viewMode == "nodes" ? "white" : "gray"
    }

    let optionsButtonStyles = {
        backgroundColor: viewMode == "options" ? "white" : "gray"
    }

    const renderPanel = (viewMode) => {
        if (viewMode === "options") {
            return <OptionPanel />
        } else if (viewMode === "nodes") {
            return <NodePanel />
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
                    onClick={() => dispatch(setViewMode("options"))}
                >Options</button>
            </div>
            {renderPanel(viewMode)}
        </div>
    )
}
