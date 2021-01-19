import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    setControls,
    setMaterialNameSegmentMap,
    selectMaterialNameSegmentMap,
} from './viewerSlice';

const TextureConfigurationPanel = props => {
    const { option } = props;
    const dispatch = useDispatch();
    const materialNameSegmentMap = useSelector(selectMaterialNameSegmentMap);


    const renderMaterialNameSegmentMap = () => Object.keys(materialNameSegmentMap).map(segment => {

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
  
    return (
      <div className="grouping__container">
          <div>
            <h4>Code Name Map:</h4>
            {renderMaterialNameSegmentMap()}
          </div>
      </div>
    )
}

export default TextureConfigurationPanel;
