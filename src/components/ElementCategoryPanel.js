import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectGroupingOptions,
  selectHiddenCategoryConfigurations,
  setGroupingOptions,
  setHiddenCategoryConfigurations,
  updateControl,
} from './viewerSlice';

const ElementCategoryPanel = props => {

    const dispatch = useDispatch();
    const { option } = props;
    const categoryElements = useSelector(selectGroupingOptions);
    const hiddenCategoryConfigurations = useSelector(selectHiddenCategoryConfigurations);

    const renderDesignationMultiselect = () => {     

      return categoryElements.map((categoryElement, index) => {
        
        let categoryContainsCurrentElement = option.configuration.designations[categoryElement.designation] !== undefined

        if (categoryElement.isAvailable || categoryContainsCurrentElement) {
        
          return (
            <div key={`element-${option.id}-${index}`}>
              <div style={{display: "flex"}}>
                <div style={{display: "flex", flex: "1 1 auto"}}>
                  <input 
                    type="checkbox" 
                    checked={categoryContainsCurrentElement}
                    onChange={() => {                 
                      let newCategoryElements = JSON.parse(JSON.stringify(categoryElements))
                      let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                      let newConfiguration = {};
                      
                      if (newDesignations[categoryElement.designation] != undefined) {
                        delete newDesignations[categoryElement.designation];
                        newConfiguration = {
                          designations: newDesignations,
                          allowsAnimation: option.configuration.allowsAnimation.filter(a => a !== categoryElement.designation)
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
              {renderDisableMultiSelect(index)}
            </div>
          )

        }
        return null;
      })
    }

    const renderDisableMultiSelect = (index) => {
    
      let currentElementDesignation = categoryElements[index].designation
      let categoryContainsCurrentElement = option.configuration.designations[currentElementDesignation] != undefined
      
      let otherSelectedElements = categoryElements.filter(element => !element.isAvailable && option.configuration.designations[element.designation] == undefined)
      if (categoryContainsCurrentElement && otherSelectedElements.length > 0) {
        console.log("otherSelectedElements:")
        console.log(otherSelectedElements)
        return (
          <div style={{textAlign: "left", marginLeft: 16}}>
            <div style={{marginLeft: 4}}>Disable when selected:</div>
            {otherSelectedElements.map(element => {
              let showChecked = false;
              if (hiddenCategoryConfigurations[currentElementDesignation] != undefined) {
                if (hiddenCategoryConfigurations[currentElementDesignation].includes(element.designation)) {
                  showChecked = true;
                }
              }
              return(
              <div style={{display: "flex"}}>
                <input 
                  type="checkbox" 
                  checked={showChecked}
                  onChange={() => {        
                    let newHiddenCategoryConfigurations = JSON.parse(JSON.stringify(hiddenCategoryConfigurations))
                    if(showChecked) {
                      newHiddenCategoryConfigurations[currentElementDesignation] = newHiddenCategoryConfigurations[currentElementDesignation].filter(hiddenConfigElement => hiddenConfigElement.designation != element.designation)
                      newHiddenCategoryConfigurations[element.designation] = newHiddenCategoryConfigurations[currentElementDesignation].filter(hiddenConfigElement => hiddenConfigElement.designation != currentElementDesignation)
                    } else {
                      if (newHiddenCategoryConfigurations[currentElementDesignation] === undefined) {
                        newHiddenCategoryConfigurations[currentElementDesignation] = [];
                      }
                      newHiddenCategoryConfigurations[currentElementDesignation].push(element.designation)
                      if(newHiddenCategoryConfigurations[element.designation] === undefined) {
                        newHiddenCategoryConfigurations[element.designation] = [];
                      }
                      newHiddenCategoryConfigurations[element.designation].push(currentElementDesignation);
                    }

                    dispatch(setHiddenCategoryConfigurations(newHiddenCategoryConfigurations))
                  }}
                />
                <div>{element.designation}</div>
              </div>
            )})}
          </div>
        )
      }
    }
  
    return (
      <div className="grouping__container">
        <div className="additional-color__container" id={`${option.id}-additionalColors`}>
          {renderDesignationMultiselect()}
        </div>
      </div>
    )
}

export default ElementCategoryPanel;
