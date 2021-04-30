import React from 'react';
import { useDispatch } from 'react-redux';
import { 
	toggleImportModalDisplay, 
    setModelList,
} from './viewerSlice';

const ImportModal = () => {

    const dispatch = useDispatch();

    return (
        <div id="import-modal">
            <div className="modal__content">
                <span class="close"
                    onClick={() => dispatch(toggleImportModalDisplay())}>&times;</span>
                <div className="modal__header">
                    <h1>Paste Controls Here:</h1>
                </div>
                <button
					onClick={() => {
						let jsInput = document.getElementById("js-input").value;
						let importString = jsInput.replace("var modelList = ", "")
						let modelList = JSON.parse(importString)
                        dispatch(setModelList(modelList))
                        dispatch(toggleImportModalDisplay())
					}}
				>Import</button>
				<input id="js-input" />
            </div>
        </div>
    )
}

export default ImportModal;
