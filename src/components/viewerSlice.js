import { createSlice } from '@reduxjs/toolkit';
import { buildSceneGraph, buildCategoryOptions } from './utils'

const initialState = {
  modelId: '',
  materials: [],
  animations: [],
  sceneGraph: [],
  controls: [],
  textureControls: [],
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
          designations: [],
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
    setTextureControls: (state, action) => { 
      for (var i=0; i<action.payload.length; ++i) {
        state.latestControlId = state.latestControlId += 1;
        action.payload[i].id = state.latestControlId;
      }     
      state.textureControls = action.payload;
    },
    addTextureControls: (state) => {
      state.controls = state.controls.concat(state.textureControls)
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
  setTextureControls,
  addTextureControls,
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

export const selectModelId = state => state.modelId;

export const selectMaterials = state => state.materials;

export const selectAnimations = state => state.animations;

export const selectControls = state => state.controls;

export const selectTextureControls = state => state.controls;

export const selectDisableButtons = state => state.disableButtons;

export const selectSceneGraph = state => state.sceneGraph;

export const selectSketchfabAPI = state => state.sketchfabAPI;

export const selectSceneGraphIsVisible = state => state.sceneGraphIsVisible;

export const selectViewMode = state => state.viewMode;

export const selectSurfaceOptionMap = state => state.surfaceOptionMap;

export const selectSurfaceConfigurationMode = state => state.surfaceConfigurationMode;

export const selectMaterialNameSegmentMap = state => state.materialNameSegmentMap;

export const selectSurfaceAttributeNameMap = state => state.surfaceAttributeNameMap;

export const selectGroupingOptions = state => state.groupingOptions;

export const selectHiddenCategoryConfigurations = state => state.hiddenCategoryConfigurations;

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

export default viewerSlice.reducer;
