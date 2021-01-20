import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    updateControl,
    setMaterialNameSegmentMap,
    selectMaterialNameSegmentMap,
} from './viewerSlice';
import { ReactSortable } from 'react-sortablejs';

const TextureConfigurationPanel = props => {
    const { option } = props;
    const dispatch = useDispatch();
    const materialNameSegmentMap = useSelector(selectMaterialNameSegmentMap);


    const renderMaterialNameSegmentMapOld = () => Object.keys(materialNameSegmentMap).map(segment => {

        if (option.configuration.options.includes(segment)) {
            return (
                <div>
                    {segment}
                    <input 
                    value={materialNameSegmentMap[segment]} 
                    onChange={(e) => {
                        let newMaterialSegmentMap = JSON.parse(JSON.stringify(materialNameSegmentMap))
                        newMaterialSegmentMap[segment] = e.target.value;
                        dispatch(setMaterialNameSegmentMap(newMaterialSegmentMap))
                    }}
                    />
                </div>
            )
        }
    })

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
