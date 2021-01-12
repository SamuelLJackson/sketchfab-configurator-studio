import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateControl,
  selectGroupingOptions,
  setGroupingOptions,
} from './viewerSlice';

export default props => {

    const dispatch = useDispatch();
    const { option } = props;
    const categoryElements = useSelector(selectGroupingOptions);

    const renderDesignationMultiselect = () => {
      return categoryElements.map((categoryElement, index) => {
        
        let controlContainsElement = option.configuration.designations[categoryElement.designation] != undefined

        if (categoryElement.isAvailable || controlContainsElement) {
        
          return (
            <div key={`element-${option.id}-${index}`}>
              <div style={{display: "flex"}}>
                <div style={{display: "flex", flex: "1 1 auto"}}>
                  <input 
                    type="checkbox" 
                    checked={controlContainsElement}
                    onChange={() => {                 
                      let newCategoryElements = JSON.parse(JSON.stringify(categoryElements))
                      let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                      let newConfiguration = {};
                      
                      if (newDesignations[categoryElement.designation] != undefined) {
                        delete newDesignations[categoryElement.designation];
                        newConfiguration = {
                          designations: newDesignations,
                          allowsAnimation: option.configuration.allowsAnimation.filter(a => a != categoryElement.designation)
                        }
                        newCategoryElements[index].isAvailable = true;
                      } else {
                        newDesignations[categoryElement.designation] = "";
                        let newDisablesAnimation = option.configuration.allowsAnimation.map(a => a)
                        newDisablesAnimation.push(categoryElement.designation)
                        newConfiguration = {
                          designations: newDesignations,
                          allowsAnimation: newDisablesAnimation,
                        }
                        newCategoryElements[index].isAvailable = false;
                      }
                      dispatch(setGroupingOptions(newCategoryElements))
                      dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))
                    }}
                  />
                  <div>{categoryElement.designation}</div>
                </div>
                <div>Animation:</div>
                <input 
                  type="checkbox" 
                  checked={option.configuration.allowsAnimation.includes(categoryElement.designation)}
                  disabled={option.configuration.designations[categoryElement.designation] == undefined}
                  onChange={() => {
                    let newConfiguration = {};                  
                    let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                    if (option.configuration.allowsAnimation.includes(categoryElement.designation)) {
                      newConfiguration = {
                        designations: newDesignations,
                        allowsAnimation: option.configuration.allowsAnimation.filter(a => a != categoryElement.designation)
                      }
                    } else {
                      let newDisablesAnimation = option.configuration.allowsAnimation.map(a => a)
                      newDisablesAnimation.push(categoryElement.designation)
                      newConfiguration = {
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
                  disabled={option.configuration.designations[categoryElement.designation] == undefined}
                  value={option.configuration.designations[categoryElement.designation]}
                  onChange={e => {
                    let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                    newDesignations[categoryElement.designation] = e.target.value;
                    let newConfiguration = {
                      designations: newDesignations,
                      allowsAnimation: option.configuration.allowsAnimation.map(a => a),
                    }
                    dispatch(updateControl({id: option.id, key: "configuration", value: newConfiguration}))                  
                  }}
                />
              </div>
            </div>
          )

        }
        return null;
      })
    }
  
    return (
      <div className="grouping__container">
        <div className="additional-color__container" id={`${option.id}-additionalColors`}>
          {renderDesignationMultiselect()}
        </div>
      </div>
    )
}
