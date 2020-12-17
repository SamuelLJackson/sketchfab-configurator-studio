import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSurfaceConfigurationMode,
  setSurfaceAttributeNameMap,
  setMaterialNameSegmentMap,
  selectMaterialNameSegmentMap,
  selectSurfaceAttributeNameMap,
} from './viewerSlice';

export default () => {

    const dispatch = useDispatch();
    const materialNameSegmentMap = useSelector(selectMaterialNameSegmentMap);
    const surfaceAttributeNameMap = useSelector(selectSurfaceAttributeNameMap);
    dispatch(setSurfaceConfigurationMode(true))

    const renderMaterialNameSegmentMap = () => Object.keys(materialNameSegmentMap).map(segment => (
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
    ))

    const renderAttributeName = surfaceName => surfaceAttributeNameMap[surfaceName].map((name, index) => (
      <div>
        Attribute {index}
        <input
          value={name}
          onChange={(e) => {
            let newSurfaceAttributeNames = JSON.parse(JSON.stringify(surfaceAttributeNameMap))
            newSurfaceAttributeNames[surfaceName][index] = e.target.value;
            dispatch(setSurfaceAttributeNameMap(newSurfaceAttributeNames))
          }}
        />
      </div>
    ))

    const renderAttributeNames = () => Object.keys(surfaceAttributeNameMap).map(surfaceName => (
      <div>
        {surfaceName}
        {renderAttributeName(surfaceName)}
      </div>
    ))
  
    return (
      <div className="grouping__container">
          <div>
            <h4>Surfaces & Attributes</h4>
            {renderAttributeNames()}
          </div>
          <div>
            <h4>Code Name Map:</h4>
            {renderMaterialNameSegmentMap()}
          </div>
      </div>
    )
}
