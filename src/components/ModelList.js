import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    selectModelList,
    selectActiveModelGUID,
    setModelList,
    setActiveModelGUID,
    createModel,
} from './viewerSlice';
import initializeViewer from './initializeViewer';
import { ReactSortable } from 'react-sortablejs';

const modelListStyles = {
    width: "auto",
    minWidth: 100,
    paddingLeft: 10,
    paddingRight: 10, 
    textAlign: "center", 
    borderRadius: 25,
    border: "1px solid",
}
const inActiveStyles = { 
    backgroundColor: "teal", 
    color: "white", 
    borderColor: "white",
    cursor: "pointer",
    ...modelListStyles,
}
const activeStyles = { 
    backgroundColor: "white", 
    color: "teal", 
    borderColor: "teal",
    ...modelListStyles,
}

const ModelList = () => {
    const modelList = useSelector(selectModelList);
    const activeModelGuid = useSelector(selectActiveModelGUID)


    const dispatch = useDispatch();
    return (
        <div style={{display: "flex", justifyContent: "right"}}>
            <ReactSortable 
                style={{display: "flex", justifyContent: "right"}}
                list={modelList} 
                setList={modelList => dispatch(setModelList(modelList))}>
                    {modelList.map(model => (
                        <div 
                            style={activeModelGuid === model.guid ? activeStyles : inActiveStyles}
                            id={"model-" + model.guid}
                            onClick={e => {
                                let modelGuid = Number(e.target.id.split("-")[1])
                                dispatch(setActiveModelGUID(modelGuid))
                                dispatch(initializeViewer(model.uid))
                            }}
                        >
                            {model.name}
                            <svg 
                                fill="currentColor" 
                                preserveAspectRatio="xMidYMid meet" 
                                height="1em" 
                                width="1em" 
                                viewBox="0 0 40 40" 
                                style={{verticalAlign: "middle", cursor: "pointer"}}
                                onClick={e => {
                                    let newModelList = modelList.filter(m => m.guid !== model.guid)
                                    dispatch(setModelList(newModelList))
                                }}
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
                        </div>
                    ))}
            </ReactSortable>
            <div 
                style={{
                    ...activeStyles,
                    cursor: "pointer",
                    width: 320,
                    padding: 0,
                    
                }}
                onClick={() => {
                    dispatch(createModel())
                }}
            >+ Add Model</div>
        </div>
    )
  }
  
  export default ModelList;
  
  /********
   * 
   * HELLO FROM ThE OTHER SIIIIIDE
   * 
   *********/