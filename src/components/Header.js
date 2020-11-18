import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  initializeViewer, 
  selectModelId, 
  setModelId, 
  toggleModalDisplay,
  selectDisableButtons,
  selectIsPreviewMode,
  setIsPreviewMode,
} from './viewerSlice';

export default () => {
  const modelId = useSelector(selectModelId);
  const disableButtons = useSelector(selectDisableButtons);
  const isPreviewMode = useSelector(selectIsPreviewMode);
  
  const dispatch = useDispatch();
  return (
    <div className="header">
      <h1 className="header__title">Configurator Studio</h1>
      <div className="header__buttons">
        <input id="model-id-input"
          value={modelId}
          onChange={e => dispatch(setModelId(e.target.value))}
        />
        <button 
          id="displayButton"    
          className="header__button"      
          onClick={() => dispatch(initializeViewer(modelId))}
        >Load Model
        </button>
        {/*
        <button
          className="header__button"
          disabled={disableButtons}
          onClick={() => dispatch(setIsPreviewMode(!isPreviewMode))}
        >{isPreviewMode ? "Studio View" : "Preview"}</button>
        */}
        <button 
          id="export-javascript"
          className="header__button"
          disabled={disableButtons}
          onClick={() => dispatch(toggleModalDisplay())}>Export</button>
      </div>
    </div>
  )
}
