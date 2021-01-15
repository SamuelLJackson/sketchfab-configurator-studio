import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleOptionChoiceModalDisplay, 
  selectControls, 
  selectDisableButtons,
  updateControl,
  setControls,
} from './viewerSlice';
import ColorPanel from './ColorPanel';
import TogglePanel from './TogglePanel';
import ElementCategoryPanel from './ElementCategoryPanel'
import SurfaceConfiguration from './SurfaceConfigurationPanel';
import AnimationPanel from './AnimationPanel';
import { ReactSortable } from 'react-sortablejs';

const OptionPanel = () => {  
  
  const options = useSelector(selectControls);
  const disableButtons = useSelector(selectDisableButtons);

  const dispatch = useDispatch();

const renderPanel = (option) => {
  if (option.type === "color") {
    return <ColorPanel option={option} />;
  } else if (option.type === "toggle") {
    return <TogglePanel option={option} />;
  } else if (option.type === "animation") {
    return <AnimationPanel option={option} />;
  } else if (option.type === "category") {
    return <ElementCategoryPanel option ={option} />;
  } else if (option.type === "surfaceConfiguration") {
    return <SurfaceConfiguration />;
  }
}

const renderOptions = (options, dispatch) => {
  
  let optionsHtml = options.map((option, index, array) => (
    <div className="single-option__panel" key={`option-${index}`}>
      <div className="single-option__header">
        <h3 className="single-option__title">{option.id}. {option.type}</h3>
        <button 
          id={`collapseButton${option.id}`}
          className="collapse__button"
          onClick={(e) => dispatch(updateControl({
            id: option.id,
            key: "isExpanded",
            value: !option.isExpanded
          }))}
        >
          {option.isExpanded ? "Collapse" : "Expand"}
        </button>
        <button 
          title="Remove option"
          onClick={() => {
            const newArray = array.filter(control => control.id !== option.id);
            dispatch(setControls(newArray));
          }}
        >
          <svg 
            fill="currentColor" 
            preserveAspectRatio="xMidYMid meet" 
            height="1em" 
            width="1em" 
            viewBox="0 0 40 40" 
            style={{verticalAlign: "middle"}}
          >
            <g>
              <path d="m15.9 30.7v-15.7q0-0.3-0.2-0.5t-0.5-0.2h-1.4q-0.3 0-0.5 0.2t-0.2 0.5v15.7q0 0.3 0.2 
              0.5t0.5 0.2h1.4q0.3 0 0.5-0.2t0.2-0.5z m5.7 0v-15.7q0-0.3-0.2-0.5t-0.5-0.2h-1.4q-0.3 0-0.5 
              0.2t-0.2 0.5v15.7q0 0.3 0.2 0.5t0.5 0.2h1.4q0.3 0 0.5-0.2t0.2-0.5z m5.8 
              0v-15.7q0-0.3-0.2-0.5t-0.6-0.2h-1.4q-0.3 0-0.5 0.2t-0.2 0.5v15.7q0 0.3 0.2 0.5t0.5 
              0.2h1.4q0.4 0 0.6-0.2t0.2-0.5z m-12.2-22.1h10l-1.1-2.6q-0.1-0.2-0.3-0.3h-7.1q-0.2 
              0.1-0.4 0.3z m20.7 0.7v1.4q0 0.3-0.2 0.5t-0.5 0.2h-2.1v21.2q0 1.8-1.1 3.2t-2.5 
              1.3h-18.6q-1.4 0-2.5-1.3t-1-3.1v-21.3h-2.2q-0.3 0-0.5-0.2t-0.2-0.5v-1.4q0-0.3 
              0.2-0.5t0.5-0.2h6.9l1.6-3.8q0.3-0.8 1.2-1.4t1.7-0.5h7.2q0.9 0 1.8 0.5t1.2 1.4l1.5 
              3.8h6.9q0.3 0 0.5 0.2t0.2 0.5z"></path>
            </g>
          </svg>
        </button>
      </div>
      <div style={{display: option.isExpanded ? "block" : "none"}}>
        <div style={{display:"flex"}}>
          <p className="nameFieldTitle">Name:</p>
          <input 
            type="text" 
            name="colorName" 
            id="colorName" 
            value={option.name} 
            onChange={(e) => dispatch(updateControl({id: option.id, key: "name", value: e.target.value}))}
          />
        </div>
        {renderPanel(option)}
      </div>
    </div>
  ))

  return optionsHtml;
}

  return (
    <div style={{overflow: "auto", display: "flex", flexDirection: "column"}}>
      <button 
        className="add-option add__button" 
        disabled={disableButtons}
        onClick={() => dispatch(toggleOptionChoiceModalDisplay())}
      >+ Add Option</button>
      <div className="single-option__panels__container">
        <ReactSortable list={options} setList={options => dispatch(setControls(options))}>
          {renderOptions(options, dispatch)}
        </ReactSortable>
      </div>
    </div>
  )
}

export default OptionPanel;
