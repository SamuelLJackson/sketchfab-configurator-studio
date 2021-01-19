import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectGroupingOptions,
  selectHiddenCategoryConfigurations,
  setGroupingOptions,
  setHiddenCategoryConfigurations,
  updateControl,
} from './viewerSlice';
import { ReactSortable } from 'react-sortablejs';

const ElementCategoryPanel = props => {

    const dispatch = useDispatch();
    const { option } = props;
    const categoryElements = useSelector(selectGroupingOptions);
    const hiddenCategoryConfigurations = useSelector(selectHiddenCategoryConfigurations);

    const renderDesignationMultiselect = () => {     

      return categoryElements.map((categoryElement, index) => {
        
        let categoryContainsCurrentElement = false;
        for (let i=0; i<option.configuration.designations.length; ++i) {
          if (option.configuration.designations[i].name === categoryElement.designation) {
            categoryContainsCurrentElement = true;
            break;
          }
        }

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

                      let filteredDesignations = newDesignations.filter(des => des.name !== categoryElement.designation)                      
                      newCategoryElements[index].isAvailable = true;

                      let newDisablesAnimation = option.configuration.allowsAnimation.filter(a => a !== categoryElement.designation)

                      if (newDesignations.length === filteredDesignations.length) {
                        filteredDesignations.push({name: categoryElement.designation, humanReadable: categoryElement.designation})
                        newCategoryElements[index].isAvailable = false;
                        var selectedElement = newCategoryElements.splice(index, 1)[0]
                        var numberOfSelectedElements = filteredDesignations.length;
                        newCategoryElements.splice(numberOfSelectedElements-1, 0, selectedElement)
                        newDisablesAnimation.push(categoryElement.designation)
                      }
                      newConfiguration = {
                        designations: filteredDesignations,
                        allowsAnimation: newDisablesAnimation,
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
                  disabled={option.configuration.designations.filter(element => element.name === categoryElement.designation).length === 0}
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
                  disabled={option.configuration.designations.filter(element => element.name === categoryElement.designation).length === 0}
                  value={option.configuration.designations.filter(element => element.name === categoryElement.designation).length === 1 ? option.configuration.designations.filter(element => element.name === categoryElement.designation)[0].humanReadable : ""}
                  onChange={e => {
                    let newDesignations = JSON.parse(JSON.stringify(option.configuration.designations));
                    for (let i=0; i<newDesignations.length; ++i) {
                      if (newDesignations[i].name === categoryElement.designation) {
                        newDesignations[i].humanReadable = e.target.value;
                      }
                    }
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
      let categoryContainsCurrentElement = option.configuration.designations[currentElementDesignation] !== undefined
      
      let otherSelectedElements = categoryElements.filter(element => !element.isAvailable && option.configuration.designations[element.designation] === undefined)
      if (categoryContainsCurrentElement && otherSelectedElements.length > 0) {
        console.log("otherSelectedElements:")
        console.log(otherSelectedElements)
        return (
          <div style={{textAlign: "left", marginLeft: 16}}>
            <div style={{marginLeft: 4}}>Disable when selected:</div>
            {otherSelectedElements.map(element => {
              let showChecked = false;
              if (hiddenCategoryConfigurations[currentElementDesignation] !== undefined) {
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
                      newHiddenCategoryConfigurations[currentElementDesignation] = newHiddenCategoryConfigurations[currentElementDesignation].filter(hiddenElementDesignation => hiddenElementDesignation !== element.designation)
                      newHiddenCategoryConfigurations[element.designation] = newHiddenCategoryConfigurations[element.designation].filter(hiddenElementDesignation => hiddenElementDesignation !== currentElementDesignation)
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
          <ReactSortable list={categoryElements} setList={categoryElements => dispatch(setGroupingOptions(categoryElements))}>
            {renderDesignationMultiselect()}          
          </ReactSortable>
        </div>
      </div>
    )
}

export default ElementCategoryPanel;
