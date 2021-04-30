import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleImportModalDisplay,
  toggleModalDisplay,
  selectDisableButtons,
} from './viewerSlice';

const Header = () => {
  const disableButtons = useSelector(selectDisableButtons);
  
  const dispatch = useDispatch();
  return (
    <div className="header">
      <h1 className="header__title">Configurator Studio - v1.0.26</h1>

      <div className="header__buttons">
        <button 
          id="import-javascript"
          className="header__button"
          onClick={() => dispatch(toggleImportModalDisplay())}>Import Configuration</button>
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
