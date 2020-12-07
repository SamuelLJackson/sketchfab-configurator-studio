import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSceneGraph,
  updateControl,
} from './viewerSlice';

export default props => {

    const dispatch = useDispatch();
    const { option } = props;
    const sceneGraph = useSelector(selectSceneGraph);

    const sceneGraphHtml = sceneGraph.map(node => <option value={node.instanceID}>{addDashes(node.depth)}{node.name}</option>)
    sceneGraphHtml.unshift(<option value={0}>Select a Node</option>)
  
    return (
      <select 
        name="nodes" 
        id="nodes"
        className="material__select"
        value={option.entity.instanceID}
        onChange={e => dispatch(updateControl({id: option.id, key: "entity", value: {instanceID: e.target.value}}))}
      >
        {sceneGraphHtml}
      </select>
    )
}
  
const addDashes = number => {
    var dashes = "";
    for (let i=0; i<number; ++i) {
        dashes += "--"
    }

    return dashes;
}
