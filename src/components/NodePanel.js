import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSceneGraph,
  selectSketchfabAPI,
  setSceneGraphIsVisible,
  selectSceneGraphIsVisible,
  setAllNodesVisible,
} from './viewerSlice';

const NodePanel = () => {
    const dispatch = useDispatch()
    const sceneGraph = useSelector(selectSceneGraph);
    const sketchfabAPI = useSelector(selectSketchfabAPI);
    const sceneGraphIsVisible = useSelector(selectSceneGraphIsVisible);

    const sceneGraphHtml = sceneGraph.map(node => {
      return (
        <div style={{display: "flex"}}>
          <input 
            id={node.instanceID}
            type="checkbox" 
            checked={sceneGraphIsVisible[node.instanceID]}
            onChange={(e) => {
                if (e.target.checked) {
                    sketchfabAPI.show(e.target.id)
                    dispatch(setSceneGraphIsVisible({id: e.target.id, value: true}))
                } else {
                    sketchfabAPI.hide(e.target.id)
                    dispatch(setSceneGraphIsVisible({id: e.target.id, value: false}))
                }
            }}
          />
          <div className="node-name">{addDashes(node.depth)}{node.name}</div>
        </div>
      )
    })

    sceneGraphHtml.unshift(
      <div style={{display: "flex",borderBottom: "1px solid black"}}>
        <input 
          type="checkbox" 
          checked={Object.values(sceneGraphIsVisible).reduce((accum, curr) => accum && curr)}
          onChange={(e) => {
            dispatch(setAllNodesVisible(e.target.checked))
          }}
        />
        <div className="node-name">All Nodes</div>
      </div>
    )

  return (
    <div style={{overflow: "auto"}}>
        <div id="nodeControls">
            {sceneGraphHtml}
        </div>
        <div id="animationControls"></div>
    </div>
  )
}

const addDashes = number => {
    var dashes = "";
    for (let i=0; i<number; ++i) {
        dashes += "--"
    }

    return dashes;
}

export default NodePanel;
