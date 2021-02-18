import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAnimations,
  selectControls,
  updateControl,
} from './viewerSlice';

const AnimationPanel = props => {           
    const dispatch = useDispatch();
    const { option } = props;
    const animations = useSelector(selectAnimations);
    const controls = useSelector(selectControls)

    const animationOptions = animations.map(animation => <option value={animation[0]}>{animation[1]}</option>)
    animationOptions.unshift(<option value="none">Select an Animation</option>)

    return (
      <div style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
        <div style={{display: "flex"}}>
          <input
            type="checkbox"
            value={option.configuration.isDisabledInitially}
            onChange={(e) => {
              for (let i=0; i<controls.length; ++i) {
                let newXConfiguration = {
                  ...controls[i].configuration,
                  isDisabledInitially: false,
                }
                dispatch(updateControl({id: controls[i].id, key: "configuration", value: newXConfiguration}))
              }
              let newConfiguration = {
                ...option.configuration,
                isDisabledInitially: !option.configuration.isDisabledInitially,
              }
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
            }}
          />
          <div>Disabled Initially</div>
        </div>
        <div>
          <label>Animation:</label>
          <select 
            name="animationSelect"
            value={option.configuration.animationUID}
            onChange={(e) => {
              let newConfiguration = {
                ...option.configuration,
                animationUID: e.target.value,
                animationName: e.target.options[e.target.selectedIndex].textContent,
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

export default AnimationPanel;
