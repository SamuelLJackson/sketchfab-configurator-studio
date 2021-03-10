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
    width: 160, 
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
                        >{model.name}</div>
                    ))}
            </ReactSortable>
            <div 
                style={{
                    ...activeStyles,
                    cursor: "pointer",
                    width: 160,
                    
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