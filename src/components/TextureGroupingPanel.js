import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSceneGraph,
  updateControl,
  setGroupingOptions,
} from './viewerSlice';

export default props => {

    const dispatch = useDispatch();
    const { option } = props;
    const sceneGraph = useSelector(selectSceneGraph);

    let uniqueStrings = [];
    let groupingOptions = [];
    for (let i=0; i<sceneGraph.length; ++i) {
      let nodeNameArray = sceneGraph[i].name.split("-").filter(string => string != "")
      let mainDesignation = nodeNameArray[0];
      let capitalLetter = nodeNameArray[1];
      let detailedTitle = nodeNameArray[2];
      for (let i=3; i<nodeNameArray.length; ++i) {
        detailedTitle += nodeNameArray[i];
      }

      const irrelevantStrings = ["Group", "RootNode", "MatrixTransform"];
      if (uniqueStrings.indexOf(mainDesignation) == -1 &&
        irrelevantStrings.indexOf(mainDesignation) == -1) {
        uniqueStrings.push(mainDesignation);
        groupingOptions.push({
          instanceID: sceneGraph[i].instanceID,
          designation: mainDesignation,
          capitalLetter: capitalLetter,
          detailedTitle: detailedTitle,
        })
      }
    }
    dispatch(setGroupingOptions(groupingOptions))

    const renderDesignationMultiselect = grouping => {
      return groupingOptions.map(groupingOption => {
        
        return (
          <div style={{display: "flex"}}>
            <div style={{display: "flex", flex: "1 1 auto"}}>
              <input 
                checked={grouping.designations.includes(groupingOption.designation)}
                type="checkbox" 
                onChange={() => {
                  let newGroupings = [];
                  for (let i=0; i<option.groupings.length; ++i) {
                    if (grouping.id == option.groupings[i].id) {
                      if (grouping.designations.includes(groupingOption.designation)) {
                        newGroupings[i] = {
                          id: option.groupings[i].id,
                          name: option.groupings[i].name,
                          designations: option.groupings[i].designations.filter(a => a != groupingOption.designation),
                          allowsAnimation: option.groupings[i].allowsAnimation.filter(a => a != groupingOption.designation)
                        }
                      } else {
                        let newDesignations = option.groupings[i].designations.map(a => a)
                        newDesignations.push(groupingOption.designation)
                        let newDisablesAnimation = option.groupings[i].allowsAnimation.map(a => a)
                        newDisablesAnimation.push(groupingOption.designation)
                        newGroupings[i] = {
                          id: option.groupings[i].id,
                          name: option.groupings[i].name,
                          designations: newDesignations,
                          allowsAnimation: newDisablesAnimation,
                        }
                      }
                    } else {
                      newGroupings[i] = { 
                        id: option.groupings[i].id,
                        name: option.groupings[i].name,
                        designations: option.groupings[i].designations,
                        allowsAnimation: option.groupings[i].allowsAnimation,
                      }
                    }
                  }
                  console.log(newGroupings)
                  dispatch(updateControl({id: option.id, key: "groupings", value: newGroupings}))
                }}
              />
              <div>{groupingOption.designation}</div>
            </div>
            <div>Animation:</div>
            <input 
              checked={grouping.allowsAnimation.includes(groupingOption.designation)}
              disabled={!grouping.designations.includes(groupingOption.designation)}
              type="checkbox" 
              onChange={(e) => {
                let newGroupings = [];
                for (let i=0; i<option.groupings.length; ++i) {
                  if (grouping.id == option.groupings[i].id) {
                    if (grouping.allowsAnimation.includes(groupingOption.designation)) {
                      newGroupings[i] = {
                        id: option.groupings[i].id,
                        name: option.groupings[i].name,
                        designations: option.groupings[i].designations,
                        allowsAnimation: option.groupings[i].allowsAnimation.filter(a => a != groupingOption.designation)
                      }
                    } else {
                      let newDisablesAnimation = option.groupings[i].allowsAnimation.map(a => a)
                      newDisablesAnimation.push(groupingOption.designation)
                      newGroupings[i] = {
                        id: option.groupings[i].id,
                        name: option.groupings[i].name,
                        designations: option.groupings[i].designations,
                        allowsAnimation: newDisablesAnimation,
                      }
                    }
                  } else {
                    newGroupings[i] = { 
                      id: option.groupings[i].id,
                      name: option.groupings[i].name,
                      designations: option.groupings[i].designations,
                      allowsAnimation: option.groupings[i].allowsAnimation,
                    }
                  }
                }
                console.log(newGroupings)
                dispatch(updateControl({id: option.id, key: "groupings", value: newGroupings}))
              }}
            />
          </div>
        )
      })
    }
  
    const renderAdditionalGroupings = (id, groupings, dispatch) => {
        if (groupings == null || groupings == undefined) {
          return <div></div>
        } else {
          return groupings.map((grouping, index, array) => (
            <div>
              <div className="input__container">
                <label>Grouping {index}:</label>
                <input
                  type="text"
                  value={groupings[index].name}
                  onChange={(e) => {
                    let newGroupings = [];
                    for (let i=0; i<option.groupings.length; ++i) {
                      if (grouping.id == option.groupings[i].id) {
                        newGroupings[i] = {
                          id: option.groupings[i].id,
                          name: e.target.value,
                          designations: option.groupings[i].designations,
                          allowsAnimation: option.groupings[i].allowsAnimation,
                        }
                      } else {
                        newGroupings[i] = {
                          id: option.groupings[i].id,
                          name: option.groupings[i].name,
                          designations: option.groupings[i].designations,
                          allowsAnimation: option.groupings[i].allowsAnimation,
                        }
                      }
                    }
                    dispatch(updateControl({id: option.id, key: "groupings", value: newGroupings}))
                  }}      
                />
                <button 
                  title="Remove option"
                  onClick={() => {
                    const newArray = groupings.filter(grouping => {
                      return grouping.name !== groupings[index].name
                    });
                    let transferObject = {id: option.id, key: "groupings", value: newArray};
                    dispatch(updateControl(transferObject));
                  }}
                >
                  <svg 
                    fill="currentColor" 
                    preserveAspectRatio="xMidYMid meet" 
                    height="1em" 
                    width="1em" 
                    viewBox="0 0 40 40" 
                    style={{verticalAlign: "middle"}}
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
                </button>
              </div>
              <div>{renderDesignationMultiselect(grouping)}</div>
            </div>
          ))
        }
      }
  
    return (
      <div className="grouping__container">
        <button 
          className="add__button"
          onClick={() => {
            if(option.groupings == undefined || option.groupings == null) {
                const transferObject = {
                  id: option.id, 
                  key: "groupings", 
                  value: [{id: uuidv4(), name: "grouping", designations: [], allowsAnimation: []}]
                };
                
                dispatch(updateControl(transferObject));
            } else {
              let newGroupings = [];
              for (let i = 0; i<option.groupings.length; ++i) {
                newGroupings[i] = option.groupings[i];
              }
              newGroupings.push({id: uuidv4(), name: "default", designations: [], allowsAnimation: []});
              dispatch(updateControl({id: option.id, key: "groupings", value: newGroupings}));
            }
          }}
        >+ Add Grouping</button>
        <div className="additional-color__container" id={`${option.id}-additionalColors`}>
          {renderAdditionalGroupings(option.id, option.groupings, dispatch)}
        </div>
      </div>
    )
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}