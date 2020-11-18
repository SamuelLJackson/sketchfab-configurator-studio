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
      <div>
        <select 
          name="animationSelect"
          onChange={(e) => dispatch(updateControl({id: option.id, key: "animationUID", value: e.target.value}))}
        >
          {animationOptions}
        </select>
        <p>Start Time:</p>
        <input 
          type="number" 
          value={option.startTime} 
          onChange={(e) => dispatch(updateControl({id: option.id, key: "startTime", value: e.target.value}))}
        />
        <p>End Time:</p>
        <input 
          type="number" 
          value={option.endTime} 
          onChange={(e) => dispatch(updateControl({id: option.id, key: "endTime", value: e.target.value}))}
        />
      </div>
    )
}