import React from 'react';
import { useDispatch } from 'react-redux';
import { 
    updateControl,
} from './viewerSlice';
import { ReactSortable } from 'react-sortablejs';

const TextureConfigurationPanel = props => {
    const { option } = props;
    const dispatch = useDispatch();

    const renderMaterialNameSegmentMap = () => option.configuration.options.map((designation, index) => (
        <div>
            {designation.name}
            <input 
                value={designation.humanReadable} 
                onChange={(e) => {
                    let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
                    newConfiguration.options[index].humanReadable = e.target.value;
                    dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
                }}
            />
        </div>
    ))

    const updateOptions = (newOptions) => {
        let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
        newConfiguration.options = newOptions;
        dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
    }
  
    return (
      <div className="grouping__container">
        <div style={{display:"flex"}}>
            <p className="nameFieldTitle">Initial :</p>
            <select onChange={(e) => dispatch(updateControl({id: option.id, key: "initialValue", value: e.target.value}))}>
                {option.configuration.options.map((designation, index) => {
                    let selected = false;
                    if((option.initialValue === "" || option.initialValue === undefined) && index === 0) {
                        selected = true
                        dispatch(updateControl({id: option.id, key: "initialValue", value: designation.name}))
                    } else {
                        selected = designation.name === option.initialValue
                    }
                    
                    return   (<option selected={selected} value={designation.name}>{designation.name}</option>)
                })}
            </select>
        </div>
          <div>
            <h4>Code Name Map:</h4>
            <ReactSortable list={option.configuration.options} setList={newOptions => updateOptions(newOptions)}>
                {renderMaterialNameSegmentMap()}
            </ReactSortable>
          </div>
      </div>
    )
}

export default TextureConfigurationPanel;
