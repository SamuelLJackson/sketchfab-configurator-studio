var buildSceneGraph = function(state, children, depth) {
	for (let i=0; i<children.length; ++i) {
    if (children[i].type != "Group" && children[i].name != "RootNode") {
      if(children[i].name == undefined) {
        state.sceneGraph.push({
          name: children[i].type, 
          depth: depth, 
          instanceID: children[i].instanceID,
          materialID: children[i].materialID,
        });
      } else {
        state.sceneGraph.push({
          name: children[i].name, 
          depth: depth, 
          instanceID: children[i].instanceID,
          materialID: children[i].materialID,
        });
      }
    }
    state.sceneGraphIsVisible[children[i].instanceID] = true
		if (children[i].children != undefined || children[i].children != null) {			
			buildSceneGraph(state, children[i].children, depth+1);
		}
	}
}

var buildCategoryOptions = (state) => {   

  let uniqueStrings = [];
  let categoryOptions = [];
  for (let i=0; i<state.sceneGraph.length; ++i) {
    let nodeNameArray = state.sceneGraph[i].name.split("-").filter(string => string != "")
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
        instanceID: state.sceneGraph[i].instanceID,
        designation: mainDesignation,
        capitalLetter: capitalLetter,
        detailedTitle: detailedTitle,
        isAvailable: true,
      })
    }
  }
  categoryOptions.sort(function(a,b){return a.designation.charCodeAt(0)-b.designation.charCodeAt(0)})
  state.groupingOptions = categoryOptions;
}

var buildSurfaceOptions = (materials) => {  
    let surfaceOptionMap = {};
    let materialNameSegmentMap = {};
    let surfaceAttributeNameMap = {};

    let surfaceControls = [];
    
    for (let i=0; i<materials.length; ++i) {
      var matches = materials[i].name.match(/[a-zA-Z]*-[A-Z]+-[a-zA-Z]+/g);
    
      if (matches !== null) {
        let materialNameArray = materials[i].name.split("-").filter(string => string != "")
        let geometryName = materialNameArray[0];
        let materialOptions = materials[i].name.match(/[A-Z]+-/g).map(option => option.replace("-", ""));
        let primaryValue = materialOptions[0];
        
        // generate material name segment map
        for (let j=0; j<materialOptions.length; ++j) {
          materialNameSegmentMap[materialOptions[j]] = materialOptions[j];
        }
        console.log("\n\nmaterialNameSegmentMap")
        console.log(materialNameSegmentMap)

        // generate select display
        let isNewUniqueGeometry = surfaceOptionMap[geometryName] === undefined;
        if (isNewUniqueGeometry) {
          surfaceOptionMap[geometryName] = {}


          surfaceControls.push({name: "Attribute 1", geometryName: geometryName, options: [materialOptions[0]]})

          surfaceAttributeNameMap[geometryName] = ["Attribute Name"]
          surfaceOptionMap[geometryName][materialOptions[0]] = [];
          for (let j=1; j<materialOptions.length; ++j) {
            surfaceAttributeNameMap[geometryName].push("Attribute Name")
            surfaceControls.push({name: `Attribute ${j}`, geometryName: geometryName, options: [materialOptions[j]]})
            surfaceOptionMap[geometryName][primaryValue].push([materialOptions[j]])
          }
        } else {

          for (var j=0; j<surfaceControls.length; ++j) {
            if (surfaceControls[j].geometryName === geometryName) {
              surfaceControls[j].options.push(materialOptions[0])
              for (var k=1; k<materialOptions.length; ++k) {
                surfaceControls[j+k].options.push(materialOptions[k])
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
    console.log('\n\n\n')
    console.log("surfaceControls:")
    console.log(surfaceControls)
    console.log('\n\n\n')
    return {
        surfaceOptionMap,
        materialNameSegmentMap,
        surfaceAttributeNameMap,
    }
}

module.exports = {
    buildSceneGraph,
    buildCategoryOptions,
    buildSurfaceOptions,
}
