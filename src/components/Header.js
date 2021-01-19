import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectModelId, 
  setModelId, 
  toggleModalDisplay,
  selectDisableButtons,
} from './viewerSlice';
import initializeViewer from './initializeViewer';

const Header = () => {
  const modelId = useSelector(selectModelId);
  const disableButtons = useSelector(selectDisableButtons);
  
  const dispatch = useDispatch();
  return (
    <div className="header">
      <h1 className="header__title">Configurator Studio - v1.0.8</h1>

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
        <button 
          id="export-javascript"
          className="header__button"
          disabled={disableButtons}
          onClick={() => dispatch(toggleModalDisplay())}>Export</button>
      </div>
    </div>
  )
}

export default Header;
