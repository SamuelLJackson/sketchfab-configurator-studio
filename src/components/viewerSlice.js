import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modelId: '',
  materials: [],
  animations: [],
  sceneGraph: [],
  controls: [],
  disableButtons: true,
  latestControlId: 0,
  sketchfabAPI: null,
  sceneGraphIsVisible: {},
  viewMode: "options",
  surfaceOptionMap: {},
  surfaceConfigurationMode: false,
  materialNameSegmentMap: {},
  surfaceAttributeNameMap: {},
  groupingOptions: [],
  hiddenCategoryConfigurations: {},
};

export const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    resetState: state => {
      state = initialState;
    },
    setSketchfabAPI: (state, action) => {
      state.sketchfabAPI = action.payload;
    },
    setModelId: (state, action) => {
      state.modelId = action.payload;
    },
    setMaterials: (state, action) => {
      state.materials = action.payload;
    },
    setAnimations: (state, action) => {
      state.animations = action.payload;
    },
    setSceneGraph: (state, action) => {
      buildSceneGraph(state, action.payload.children, 0);
      buildCategoryOptions(state)
    },
    setSceneGraphIsVisible: (state, action) => {
      const { id, value } = action.payload;
      state.sceneGraphIsVisible[id] = value;
    },
    createControl: (state, action) => {
      state.latestControlId = state.latestControlId += 1;
      let id = state.latestControlId;
      let defaultConfiguration = {}
      if(action.payload === "animation") {
        defaultConfiguration = {
          animationUID: "none",
          startTime: "0",
          endTime: "0",
        }
      }

      if(action.payload === "category") {
        defaultConfiguration = {
          designations: {},
          allowsAnimation: [],  
        }
      }
      state.controls.unshift({
        type: action.payload,
        id: id,
        name: action.payload,
        entityIndex: "none",
        entity: {instanceID: 0},
        configuration: defaultConfiguration,
        isExpanded: true,
      });
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setControls: (state, action) => {
      state.controls = action.payload;
    },
    toggleDisableButtons: (state) => {
      state.disableButtons = false;
    },
    updateControl: (state, action) => {
      const { id, key, value } = action.payload;
      console.log(action.payload)
      for (let i=0; i<state.controls.length; ++i) {
        if (state.controls[i].id == id) {
          state.controls[i][key] = value;
        }
      }
    },
    setSurfaceOptionMap: (state, action) => {
      console.log("setSurfaceOptionMap -> action.payload")
      console.log(action.payload)
      state.surfaceOptionMap = action.payload;
    },
    setSurfaceConfigurationMode: (state, action) => {
      state.surfaceConfigurationMode = action.payload;
    },
    setMaterialNameSegmentMap: (state, action) => {
      console.log("setMaterialNameSegmentMap -> action.payload:")
      console.log(action.payload)
      state.materialNameSegmentMap = action.payload;
    },
    setSurfaceAttributeNameMap: (state, action) => {
      state.surfaceAttributeNameMap = action.payload;
    },
    setGroupingOptions: (state, action) => {
      state.groupingOptions = action.payload;
    },
    setHiddenCategoryConfigurations: (state, action) => {
      state.hiddenCategoryConfigurations = action.payload;
    },
    setAllNodesVisible: (state, action) => {
      for(let i=0; i<Object.keys(state.sceneGraphIsVisible).length; ++i) {
        if(action.payload) {
          state.sketchfabAPI.show(Object.keys(state.sceneGraphIsVisible)[i])
        } else {
          state.sketchfabAPI.hide(Object.keys(state.sceneGraphIsVisible)[i])
        }
        state.sceneGraphIsVisible[Object.keys(state.sceneGraphIsVisible)[i]] = action.payload;
      }
    },
  },
});

export const { 
  resetState,
  setModelId, 
  createControl, 
  toggleDisableButtons,
  updateControl,
  setControls,
  setSceneGraph,
  setSceneGraphIsVisible,
  setViewMode,
  setGroupingOptions,
  setHiddenCategoryConfigurations,
  setSurfaceOptionMap,
  setSurfaceConfigurationMode,
  setMaterialNameSegmentMap,
  setSurfaceAttributeNameMap,
  setAllNodesVisible,
  setAnimations,
  setMaterials,
  setSketchfabAPI,
} = viewerSlice.actions;

export const selectModelId = state => state.viewer.modelId;

export const selectMaterials = state => state.viewer.materials;

export const selectAnimations = state => state.viewer.animations;

export const selectControls = state => state.viewer.controls;

export const selectDisableButtons = state => state.viewer.disableButtons;

export const selectSceneGraph = state => state.viewer.sceneGraph;

export const selectSketchfabAPI = state => state.viewer.sketchfabAPI;

export const selectSceneGraphIsVisible = state => state.viewer.sceneGraphIsVisible;

export const selectViewMode = state => state.viewer.viewMode;

export const selectSurfaceOptionMap = state => state.viewer.surfaceOptionMap;

export const selectSurfaceConfigurationMode = state => state.viewer.surfaceConfigurationMode;

export const selectMaterialNameSegmentMap = state => state.viewer.materialNameSegmentMap;

export const selectSurfaceAttributeNameMap = state => state.viewer.surfaceAttributeNameMap;

export const selectGroupingOptions = state => state.viewer.groupingOptions;

export const selectHiddenCategoryConfigurations = state => state.viewer.hiddenCategoryConfigurations;

export const toggleModalDisplay = () => dispatch => {
  const modal = document.getElementById('modal');

  const currentStyle = modal.style.display;
  if (currentStyle === 'block') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
  }  
}

export const toggleOptionChoiceModalDisplay = () => dispatch => {
  const modal = document.getElementById('control-choice-modal');

  const currentStyle = modal.style.display;
  if (currentStyle === 'block') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
  }  
}

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

export default viewerSlice.reducer;
