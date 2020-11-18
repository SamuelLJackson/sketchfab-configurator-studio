import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectMaterials, 
  updateControl,
} from './viewerSlice';
import hexRgb from 'hex-rgb';

export default props => {

    const dispatch = useDispatch(); 
    const { option } = props
    const materials = useSelector(selectMaterials); 

    return (
    <div>
      <div className="input__container">
        <label htmlFor="materials">Material:</label>
        {renderColorsOption(option, materials, dispatch)}
      </div>
      <div className="additional-color__container" id={`${option.id}-additionalColors`}>
        {renderAdditionalColors(option.id, option.additionalColors, dispatch)}
      </div>
      <div className="input__container">
        <button 
          id="addColor"
          onClick={() => {
            if(option.additionalColors == undefined || option.additionalColors == null) {
                const transferObject = {
                  id: option.id, 
                  key: "additionalColors", 
                  value: [{color:"#ffffff", name: "white", colorRGB: [1,1,1]}]
                };
                
                dispatch(updateControl(transferObject));
            } else {
              let newColors = [];
              for (let i = 0; i<option.additionalColors.length; ++i) {
                newColors[i] = option.additionalColors[i];
              }
              newColors.push({color: "#ffffff", name: "default", colorRGB: [1,1,1]});
              dispatch(updateControl({id: option.id, key: "additionalColors", value: newColors}));
            }
          }}
        >Add Color</button>
      </div>
    </div>
  )
}
  
const renderAdditionalColors = (id, additionalColors, dispatch) => {
    if (additionalColors == null || additionalColors == undefined) {
      return <div></div>
    } else {
      return additionalColors.map((color, index, array) => (
        <div className="input__container">
          <label htmlFor="defaultColor">Alternate Color:</label>
          <input 
            type="color" 
            name="additionalColor" 
            id={`${id}-${index}-additionalColor`} 
            value={additionalColors[index].color}
            onChange={(e) => {
              const newArray = [];
              for (let i=0; i<array.length; ++i) {
                const newColor = {};
                if (i === index) {
                  newColor.color = e.target.value;
                  newColor.colorRGB = hexRgb(e.target.value, {format: 'array'}).map(num => num/255);
                  newColor.name = array[i].name;
                } else {
                  newColor.color = array[i].color;
                  newColor.colorRGB = array[i].colorRGB;
                  newColor.name = array[i].name;
                }
                newArray[i] = newColor;
              }
              dispatch(updateControl({id: id, key: "additionalColors", value: newArray}));
            }}      
          />
          <input
            type="text"
            value={additionalColors[index].name}
            onChange={(e) => {
              const newArray = [];
              for (let i=0; i<array.length; ++i) {
                const newColor = {};
                if (i === index) {
                  newColor.color = array[i].color;
                  newColor.colorRGB = array[i].colorRGB;
                  newColor.name = e.target.value;
                } else {
                  newColor.color = array[i].color;
                  newColor.colorRGB = array[i].colorRGB;
                  newColor.name = array[i].name;
                }
                newArray[i] = newColor;
              }
              dispatch(updateControl({id: id, key: "additionalColors", value: newArray}));
            }}      
          />
        </div>
      ))
    }
  }
  
const renderColorsOption = (option, materials, dispatch) => {
  
    const materialsHtml = materials.map((material, index) => <option value={index}>{material.name}</option>)
    materialsHtml.unshift(<option value={0}>Select a Material</option>)


    return (
      <select 
        name="materials" 
        id="materials"
        onChange={(e) => {
          dispatch(updateControl({id: option.id, key: "entityIndex", value: e.target.value }));
          dispatch(updateControl({id: option.id, key: "entity", value: materials[e.target.value] }));
        }}
        value={option.entityIndex}
      >
        {materialsHtml}
      </select>
    )
}
