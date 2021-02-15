import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectGeometryCategoryOptions,
  selectControls,
  selectTextureControls,
  setUnselectedGeometries,
  updateControl,
} from './viewerSlice';
import { ReactSortable } from 'react-sortablejs';

const GeometryCategoryPanel = props => {

    const dispatch = useDispatch();
    const { option } = props;
    const unselectedGeometries = useSelector(selectGeometryCategoryOptions);
    const selectedGeometries = option.configuration.geometries;
    const controls = useSelector(selectControls)
    const textureControls = useSelector(selectTextureControls)

    const renderUnselectedGeometryMultiselect = () => unselectedGeometries.map((geometry, index) => (
            <div 
              key={`element-${option.id}-${index}`} 
              className="geometry-option"
              style={{display: "flex"}} 
              onClick={() => {
                let newUnselectedGeometries = JSON.parse(JSON.stringify(unselectedGeometries))
                let selectedGeometry = newUnselectedGeometries.splice(index, 1)[0]
                selectedGeometry.disabledTextureControls = []
                let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
                newConfiguration.geometries.push(selectedGeometry)
                dispatch(updateControl({ id: option.id, key: "configuration", value: newConfiguration }))
                dispatch(setUnselectedGeometries(newUnselectedGeometries))
              }}
            >
              <div>{geometry.designation}</div>
            </div>
          ))

    const renderSelectedGeometryMultiselect = () => {     

      return selectedGeometries.map((geometry, index) => {
        
        return (
          <div style={{display: "flex"}}>
          <div key={`element-${option.id}-${index}`}>
            <div style={{display: "flex"}}>
              <div style={{display: "flex", flex: "1 1 auto", fontWeight: "bold"}}>
                <div>{geometry.designation}</div>
              </div>
              <div>Animation:</div>
              <input 
                type="checkbox" 
                checked={geometry.allowsAnimation}
                onChange={() => {
                  let newGeometries = JSON.parse(JSON.stringify(selectedGeometries))
                  newGeometries[index].allowsAnimation = !geometry.allowsAnimation;
                  setSelectedGeometries(newGeometries)
                }}
              />
            </div>
            <div style={{display: "flex"}}>
              <div>Name:</div>
              <input
                type="text"
                placeholder="Enter human readable name"
                value={geometry.humanReadable}
                onChange={e => {
                  let newGeometries = JSON.parse(JSON.stringify(selectedGeometries))
                  newGeometries[index].humanReadable = e.target.value;
                  setSelectedGeometries(newGeometries)
                }}
              />
            </div>
            {renderDisableMultiSelect(index)}
            <div style={{textAlign: "left", marginLeft: 16}}>
              <div style={{color: "green"}}>Texture Controls (disabled)</div>
              {renderDisableTextureControls(index)}
            </div>
          </div>
          <div style={{display: "flex", flex: "1 1 auto"}}>
              <button 
                title="Remove option"
                onClick={() => {
                  let newUnselectedGeometries = JSON.parse(JSON.stringify(unselectedGeometries))
                  let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
                  let unSelectedGeometry = newConfiguration.geometries.splice(index, 1)[0]
                  newUnselectedGeometries.unshift(unSelectedGeometry)
                  dispatch(updateControl({ id: option.id, key: "configuration", value: newConfiguration }))
                  dispatch(setUnselectedGeometries(newUnselectedGeometries))
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
          </div>
        )
      })
    }

    const renderDisableTextureControls = (geometryIndex) => {
      return textureControls.map((control, index) => {
        let showChecked = option.configuration.geometries[geometryIndex].disabledTextureControls.includes(control.name)
        return (
          <div style={{display: "flex"}}>
            <input 
              type="checkbox" 
              checked={showChecked}
              onChange={() => {        
                let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
                if (showChecked) {                    
                  newConfiguration.geometries[geometryIndex].disabledTextureControls = newConfiguration.geometries[geometryIndex].disabledTextureControls.filter(disabledTextureControls => disabledTextureControls !== control.name)
                } else {                  
                  newConfiguration.geometries[geometryIndex].disabledTextureControls.push(control.name)
                }
                dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
              }}
            />
            <div>{control.name}</div>
          </div>
      )})    
    }

    const renderDisableMultiSelect = (geometryIndex) => {
    
      var multiSelects = [];
      for (let i=0; i<controls.length; ++i) {
        if (controls[i].type === "geometryCategory" && controls[i].id !== option.id) {
          
          var multiSelect = controls[i].configuration.geometries.map((geometry, complimentGeometryIndex) => {
            let showChecked = false;
            
            if (option.configuration.geometries[geometryIndex].hiddenValues === undefined) { //backwards-compatibility
              let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
              newConfiguration.geometries[geometryIndex].hiddenValues = []
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
            }
            if (option.configuration.geometries[geometryIndex].hiddenValues.includes(geometry.designation)) {
              showChecked = true;
            }
            
            return (
            <div style={{display: "flex"}}>
              <input 
                type="checkbox" 
                checked={showChecked}
                onChange={() => {        
                  let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
                  console.log("controls[i]:")
                  console.log(controls[i])
                  if(showChecked) {                    
                    newConfiguration.geometries[geometryIndex].hiddenValues = newConfiguration.geometries[geometryIndex].hiddenValues.filter(hiddenElementDesignation => hiddenElementDesignation !== geometry.designation)
                  } else {
                    newConfiguration.geometries[geometryIndex].hiddenValues.push(geometry.designation)
                  }
                  dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
                }}
              />
              <div>{geometry.designation}</div>
            </div>            
            )
          })
          multiSelects.push(
            <div>
              <div style={{marginLeft: 4, color: "blue"}}>{controls[i].name}</div>
              {multiSelect}
            </div>
          )
        }
      }
      return (
        <div style={{textAlign: "left", marginLeft: 16}}>
          <div style={{marginLeft: 4}}>Disable when selected:</div>
          {multiSelects}
        </div>
      )
    }

    const setSelectedGeometries = (selectedGeometries) => {
      let newConfiguration = JSON.parse(JSON.stringify(option.configuration))
      newConfiguration.geometries = selectedGeometries
      dispatch(updateControl({ id: option.id, key: "configuration", value: newConfiguration }))
    }
  
    return (
      <div className="grouping__container">
        <div style={{display:"flex"}}>
          <p className="nameFieldTitle">Initial :</p>
          <select onChange={(e) => dispatch(updateControl({id: option.id, key: "initialValue", value: e.target.value}))}>
            {selectedGeometries.map((geometry, index) => {
              let selected = false;
              if(option.initialValue === "" && index === 0) {
                selected = true
                dispatch(updateControl({id: option.id, key: "initialValue", value: geometry.designation}))
              } else {
                selected = geometry.designation === option.initialValue
              }
              
              return (<option selected={selected} value={geometry.designation}>{geometry.designation}</option>)
            })}
          </select>
        </div>
        <div className="additional-color__container" id={`${option.id}-additionalColors`}>
          <div style={{display: "flex", color: "blue", fontWeight: "bold"}}>Selected Geometries: {option.configuration.geometries.length}</div>
          <div style={{borderBottom: "1px solid black"}}>
            <ReactSortable list={selectedGeometries} setList={selectedGeometries => setSelectedGeometries(selectedGeometries)}>
              {renderSelectedGeometryMultiselect()}     
            </ReactSortable>
          </div>
          <div style={{display: "flex", color: "blue", fontWeight: "bold"}}>Select A Geometry:</div>
          {renderUnselectedGeometryMultiselect()}          
        </div>
      </div>
    )
}

export default GeometryCategoryPanel;
