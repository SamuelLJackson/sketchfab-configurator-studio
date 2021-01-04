import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAnimations,
  updateControl,
} from './viewerSlice';

export default props => {

    const dispatch = useDispatch();
    const { option } = props;
    const animations = useSelector(selectAnimations);

    const animationOptions = animations.map(animation => <option value={animation[0]}>{animation[1]}</option>)
    animationOptions.unshift(<option value="none">Select an Animation</option>)

    return (
      <div style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
        <div>
          <label>Animation:</label>
          <select 
            name="animationSelect"
            value={option.configuration.animationUID}
            onChange={(e) => {
              let newConfiguration = {
                ...option.configuration,
                animationUID: e.target.value,
              }
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
            }}
          >
            {animationOptions}
          </select>
        </div>
        <div>
          <label htmlFor="start">Start Time:</label>
          <input 
            type="number" 
            name="start"
            value={option.configuration.startTime} 
            onChange={(e) => {
              let newConfiguration = {
                ...option.configuration,
                startTime: e.target.value,
              }
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))}
            }
          />
        </div>
        <div>
          <label htmlFor="end">End Time:</label>
          <input 
            type="number" 
            name="end"
            value={option.configuration.endTime} 
            onChange={(e) => {
              let newConfiguration = {
                ...option.configuration,
                endTime: e.target.value,
              }
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))}
            }
          />
        </div>
      </div>
    )
}
