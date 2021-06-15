var buildSceneGraph = function(model, children, depth) {
	for (let i=0; i<children.length; ++i) {
    if (children[i].name != "RootNode") {
      if(children[i].name == undefined) {
        model.sceneGraph.push({
          name: children[i].type, 
          depth: depth, 
          instanceID: children[i].instanceID,
          materialID: children[i].materialID,
          type: children[i].type,
        });
      } else {
        model.sceneGraph.push({
          name: children[i].name, 
          depth: depth, 
          instanceID: children[i].instanceID,
          materialID: children[i].materialID,
          type: children[i].type,
        });
      }
      model.sceneGraphIsVisible[children[i].instanceID] = true
    }
		if (children[i].children != undefined || children[i].children != null) {			
			buildSceneGraph(model, children[i].children, depth+1);
		}
	}
}

var buildGeometryCategoryOptions = (model) => {   

  let uniqueStrings = [];
  let geometryCategoryOptions = [];
  for (let i=0; i<model.sceneGraph.length; ++i) {
    let nodeNameArray = model.sceneGraph[i].name.split("-").filter(string => string != "")
    let mainDesignation = nodeNameArray[0];
    let capitalLetter = nodeNameArray[1];
    let detailedTitle = nodeNameArray[2];
    for (let j=3; j<nodeNameArray.length; ++j) {
      detailedTitle += nodeNameArray[j];
    }

    const irrelevantStrings = ["Group", "RootNode", "MatrixTransform"];
    if (uniqueStrings.indexOf(mainDesignation) == -1 &&
      irrelevantStrings.indexOf(mainDesignation) == -1) {
      uniqueStrings.push(mainDesignation);

      let isFreeGeometry = true;
      for (let j=0; j<model.controls.length; ++j) {
        if (model.controls[j].type === "geometryCategory") {
          for (let k=0; k<model.controls[j].configuration.geometries.length; ++k) {
            if (model.sceneGraph[i].instanceID === model.controls[j].geometries[k].instanceID) {
              isFreeGeometry = false;
              break;
            }
          }
        }
        if (isFreeGeometry === false) {
          break;
        }
      }

      if (isFreeGeometry) {
        geometryCategoryOptions.push({
          instanceID: model.sceneGraph[i].instanceID,
          designation: mainDesignation,
          capitalLetter: capitalLetter,
          detailedTitle: detailedTitle,
          humanReadable: mainDesignation,
          hiddenValues: [],
          allowsAnimation: true,
        })

      }
    }
  }
  geometryCategoryOptions.sort(function(a,b){return a.designation.charCodeAt(0)-b.designation.charCodeAt(0)})
  model.geometryCategoryOptions = geometryCategoryOptions;
}

var buildTextureOptions = (materials) => {  
    let surfaceOptionMap = {};
    let surfaceControls = [];
    
    for (let i=0; i<materials.length; ++i) {
      var matches = materials[i].name.match(/[a-zA-Z]*-[A-Z]+-[a-zA-Z]+/g);
    
      if (matches !== null) {
        let materialNameArray = materials[i].name.split("-").filter(string => string != "")
        let geometryName = materialNameArray[0];
        let materialOptions = materials[i].name.match(/[A-Z]+-/g).map(option => option.replace("-", ""));
        let primaryValue = materialOptions[0];

        // generate select display
        let isNewUniqueGeometry = surfaceOptionMap[geometryName] === undefined;
        if (isNewUniqueGeometry) {
          surfaceOptionMap[geometryName] = {}


          surfaceControls.push({
            name: geometryName + " - Attribute 1", 
            configuration: {
              isPrimary: true,
              ordering: 0,
              geometryName: geometryName, 
              options: [{name: materialOptions[0], humanReadable: materialOptions[0]}]
            },
            entity: {instanceID: 0},
            entityIndex: "none",
            isExpanded: true,
            type: "textureCategory",     
            textureId: surfaceControls.length,       
          })

          surfaceOptionMap[geometryName][materialOptions[0]] = [];
          for (let j=1; j<materialOptions.length; ++j) {
            surfaceControls.push({
              name: `${geometryName} - Attribute ${j+1}`, 
              configuration: {
                isPrimary: false,
                ordering: j,
                geometryName: geometryName, 
                options: [{name: materialOptions[j], humanReadable: materialOptions[j]}]
              },
              entity: {instanceID: 0},
              entityIndex: "none",
              isExpanded: true,
              type: "textureCategory",      
              initialValue: "",  
            })
            surfaceOptionMap[geometryName][primaryValue].push([materialOptions[j]])
          }
        } else {
          for (var j=0; j<surfaceControls.length; ++j) {
            if (surfaceControls[j].configuration.geometryName === geometryName) {

              var optionExists = false;
              for (var k=0; k<surfaceControls[j].configuration.options.length; ++k) {
                if (surfaceControls[j].configuration.options[k].name === materialOptions[0]) {
                  optionExists = true;
                  break;
                }
              }
              if(optionExists === false) {
                surfaceControls[j].configuration.options.push({name: materialOptions[0], humanReadable: materialOptions[0]})
              }
              for (var k=1; k<materialOptions.length; ++k) {
                var optionExists = false;
                for (var l=0; l<surfaceControls[j+k].configuration.options.length; ++l) {
                  if (surfaceControls[j+k].configuration.options[l].name === materialOptions[k]) {
                    optionExists = true;
                    break;
                  }
                }
                if (optionExists === false) {
                  surfaceControls[j+k].configuration.options.push({name: materialOptions[k], humanReadable: materialOptions[k]})
                }
              }
              break;
            }
          }

          let isNewUniquePrimaryValue = surfaceOptionMap[geometryName][primaryValue] === undefined
          if (isNewUniquePrimaryValue) {
            surfaceOptionMap[geometryName][primaryValue] = [];
            for (let j=1; j<materialOptions.length; ++j) {
              surfaceOptionMap[geometryName][primaryValue].push([materialOptions[j]])
            }
          } else {
            for (let j=1; j<materialOptions.length; ++j) {
              let currentAttributeOptions = surfaceOptionMap[geometryName][primaryValue][j-1];
              let isNewUniqueValue = currentAttributeOptions.indexOf(materialOptions[j]) === -1;
              if (isNewUniqueValue) {
                currentAttributeOptions.push(materialOptions[j])
              }
            }                                  
          }
        }
      }
    }
    
    return {
        surfaceOptionMap,
        surfaceControls,
    }
}

module.exports = {
    buildSceneGraph,
    buildGeometryCategoryOptions,
    buildTextureOptions,
}
