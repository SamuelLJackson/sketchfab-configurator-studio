import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectModelList,
  selectActiveModelGUID,
  setModelId, 
  setModelName,
} from './viewerSlice';
import initializeViewer from './initializeViewer';

const ModelPanel = () => {
    const dispatch = useDispatch();
    const modelList = useSelector(selectModelList);
    const activeModelGUID = useSelector(selectActiveModelGUID)

    let activeModel = modelList.filter(model => model.guid === activeModelGUID)[0]
    if (activeModel !== undefined) {

        return (
            <div style={{display: "flex", flexDirection: "column"}}>
                <div style={{width: 160}}>Model Name:</div>
                <input
                    style={{marginBottom: 20}}
                    value={activeModel.name}
                    onChange={e => dispatch(setModelName(e.target.value))}
                />
                <div style={{width: 160}}>Model UID:</div>
                <textarea
                    placeholder="Enter Model UID here"
                    style={{width:"100%"}}
                    value={activeModel.uid}
                    onChange={e => {
                        dispatch(setModelId(e.target.value))
                        dispatch(initializeViewer(e.target.value))
                    }}
                />     
            </div>
        )
    } else {

        return <div></div>
    }
}

export default ModelPanel;
