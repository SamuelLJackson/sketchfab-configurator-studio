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
    let categoryOptions = [];
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
        categoryOptions.push({
          instanceID: sceneGraph[i].instanceID,
          designation: mainDesignation,
          capitalLetter: capitalLetter,
          detailedTitle: detailedTitle,
        })
      }
    }
    dispatch(setGroupingOptions(categoryOptions))

    const renderDesignationMultiselect = () => {
      return categoryOptions.map((groupingOption, index) => {
        
        return (
          <div key={`element-${option.id}-${index}`}>
            <div style={{display: "flex"}}>
              <div style={{display: "flex", flex: "1 1 auto"}}>
                <input 
                  type="checkbox" 
                  checked={option.configuration.designations[groupingOption.designation] != undefined}
                  onChange={() => {                 
                    let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                    let newConfiguration = {};
                    
                    if (newDesignations[groupingOption.designation] != undefined) {
                      delete newDesignations[groupingOption.designation];
                      newConfiguration = {
                        isPrimary: option.configuration.isPrimary,
                        designations: newDesignations,
                        allowsAnimation: option.configuration.allowsAnimation.filter(a => a != groupingOption.designation)
                      }
                    } else {
                      newDesignations[groupingOption.designation] = "";
                      let newDisablesAnimation = option.configuration.allowsAnimation.map(a => a)
                      newDisablesAnimation.push(groupingOption.designation)
                      newConfiguration = {
                        isPrimary: option.configuration.isPrimary,
                        designations: newDesignations,
                        allowsAnimation: newDisablesAnimation,
                      }
                    }
                    dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
                  }}
                />
                <div>{groupingOption.designation}</div>
              </div>
              <div>Animation:</div>
              <input 
                type="checkbox" 
                checked={option.configuration.allowsAnimation.includes(groupingOption.designation)}
                onChange={() => {
                  let newConfiguration = {};                  
                  let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                  if (option.configuration.allowsAnimation.includes(groupingOption.designation)) {
                    newConfiguration = {
                      isPrimary: option.configuration.isPrimary,
                      designations: newDesignations,
                      allowsAnimation: option.configuration.allowsAnimation.filter(a => a != groupingOption.designation)
                    }
                  } else {
                    let newDisablesAnimation = option.configuration.allowsAnimation.map(a => a)
                    newDisablesAnimation.push(groupingOption.designation)
                    newConfiguration = {
                      isPrimary: option.configuration.isPrimary,
                      designations: newDesignations,
                      allowsAnimation: newDisablesAnimation,
                    }
                  }
                  dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
                }}
              />
            </div>
            <div style={{display: "flex"}}>
              <div>Readable Name:</div>
              <input
                type="text"
                placeholder="Enter human readable name"
                disabled={option.configuration.designations[groupingOption.designation] == undefined}
                value={option.configuration.designations[groupingOption.designation]}
                onChange={e => {
                  let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                  newDesignations[groupingOption.designation] = e.target.value;
                  let newConfiguration = {
                    isPrimary: option.configuration.isPrimary,
                    designations: newDesignations,
                    allowsAnimation: option.configuration.allowsAnimation.map(a => a),
                  }
                  dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))                  
                }}
              />
            </div>
          </div>
        )
      })
    }
  
    return (
      <div className="grouping__container">
        <div style={{display: "flex", borderBottom: "black 1px solid", borderTop: "black 1px solid"}}>
          <input 
            type="checkbox" 
            checked={option.configuration.isPrimary}
            onChange={(e) => {
              console.log("\n\n\n\n\ne.target.checked")
              console.log(e.target.checked)
              console.log(e.target.value)
              console.log("\n\n\n")
              let newConfiguration = {...option.configuration, isPrimary: e.target.checked}
              dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
            }}
          />
          <div>Primary Category?</div>
        </div>
        <div className="additional-color__container" id={`${option.id}-additionalColors`}>
          {renderDesignationMultiselect()}
        </div>
      </div>
    )
}
