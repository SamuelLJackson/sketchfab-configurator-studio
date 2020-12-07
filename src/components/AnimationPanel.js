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
            value={option.animationUID}
            onChange={(e) => dispatch(updateControl({id: option.id, key: "animationUID", value: e.target.value}))}
          >
            {animationOptions}
          </select>
        </div>
        <div>
          <label htmlFor="start">Start Time:</label>
          <input 
            type="number" 
            name="start"
            value={option.startTime} 
            onChange={(e) => dispatch(updateControl({id: option.id, key: "startTime", value: e.target.value}))}
          />
        </div>
        <div>
          <label htmlFor="end">End Time:</label>
          <input 
            type="number" 
            name="end"
            value={option.endTime} 
            onChange={(e) => dispatch(updateControl({id: option.id, key: "endTime", value: e.target.value}))}
          />
        </div>
      </div>
    )
}
