import { createSlice } from '@reduxjs/toolkit';
import { buildSceneGraph, buildGeometryCategoryOptions } from './utils'

const initialState = {
  modelList: [],
  activeModelGUID: "",
  viewMode: "model",
  sketchfabAPI: null,
  disableButtons: true,
}

const defaultModel = {
  name: "",
  uid: "",
  guid: "",
  materials: [],
  animations: [],
  sceneGraph: [],
  controls: [],
  textureControls: [],
  latestControlId: 0,
  sceneGraphIsVisible: {},
  surfaceOptionMap: {},
  surfaceConfigurationMode: false,
  geometryCategoryOptions: [],
  isInitial: false,
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
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].uid = action.payload
        }
      }
    },
    setModelName: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].name = action.payload
        }
      }
    },
    setMaterials: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].materials = action.payload
        }
      }
    },
    setAnimations: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].animations = action.payload
        }
      }
    },
    setSceneGraph: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          buildSceneGraph(state.modelList[i], action.payload.children[0].children, 0);
          buildGeometryCategoryOptions(state.modelList[i])
        }
      }
    },
    setSceneGraphIsVisible: (state, action) => {
      const { id, value } = action.payload;
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].sceneGraphIsVisible[id] = value;
        }
      }
    },
    createControl: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].latestControlId = state.modelList[i].latestControlId += 1;
          let id = state.modelList[i].latestControlId;
          let defaultConfiguration = {}
          if(action.payload === "animation") {
            defaultConfiguration = {
              animationUID: "none",
              startTime: "0",
              endTime: "0",
              isDisabledInitially: false,
            }
          }
    
          if(action.payload === "geometryCategory") {
            defaultConfiguration = {
              designations: [],
              geometries: [],
              hiddenValues: [],
              allowsAnimation: [],  
            }
          }
          state.modelList[i].controls.unshift({
            type: action.payload,
            id: id,
            name: action.payload,
            entityIndex: "none",
            entity: {instanceID: 0},
            configuration: defaultConfiguration,
            initialValue: "",
            isExpanded: true,
          });
        }
      }
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setControls: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          let newControls = JSON.parse(JSON.stringify(action.payload))
          state.modelList[i].controls = newControls;
        }
      }
    },
    setTextureControls: (state, action) => { 
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].textureControls = [];
          for (var j=0; j<action.payload.length; ++j) {
            state.modelList[i].latestControlId = state.modelList[i].latestControlId += 1;
            state.modelList[i].textureControls.push({ ...action.payload[j], id: state.modelList[i].latestControlId})
          }     
        }
      }
    },
    addTextureControls: (state) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          if (state.modelList[i].controls.length === 0) {
            state.modelList[i].controls = state.modelList[i].controls.concat(state.modelList[i].textureControls)
          }
          for (let j=0; j<state.modelList[i].textureControls.length; ++j) {
            for (let k=0; k<state.modelList[i].controls.length; ++k) {
              if (state.modelList[i].controls[k].textureId !== state.modelList[i].textureControls[j].textureId) {
                if ( k === state.modelList[i].controls.length - 1) {
                  state.modelList[i].controls.push(state.modelList[i].textureControls[j])
                }
              } else {
                break
              }
            }
          }
          console.log("END addTextureControls")
        }
      }
    },
    toggleDisableButtons: (state) => {
      state.disableButtons = false;
    },
    updateControl: (state, action) => {
      const { id, key, value } = action.payload;
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          for (let j=0; j<state.modelList[i].controls.length; ++j) {
            if (state.modelList[i].controls[j].id == id) {
              state.modelList[i].controls[j][key] = value;
            }
          }
        }
      }
    },
    setSurfaceOptionMap: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].surfaceOptionMap = action.payload;
        }
      }
    },
    setSurfaceConfigurationMode: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].surfaceConfigurationMode = action.payload;
        }
      }
    },
    setUnselectedGeometries: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].geometryCategoryOptions = action.payload;
        }
      }
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
    setModelList: (state, action) => {
      state.modelList = [];
      let newModelList = JSON.parse(JSON.stringify(action.payload))
      for (let i=0; i<newModelList.length; ++i) {
          newModelList[i].latestControlId = 1;
          let newControls = JSON.parse(JSON.stringify(newModelList[i].controls))
          for(let j=0; j<newControls.length; ++j) {
            newModelList[i].latestControlId += 1;
            if (newControls[j].type === "animation") {
              for (let k=0; k<newModelList[i].animations.length; ++k) {
                if (newControls[j].configuration.animationName === newModelList[i].animations[k][1]) {
                  newControls[j].configuration.animationUID = newModelList[i].animations[k][0]
                }
              }
            }
            if (newControls[j].type === "textureCategory") {
              newModelList[i].surfaceConfigurationMode = true
            }
            if (newControls[j].type === "geometryCategory") {
              for (let k=0; k<newControls[j].configuration.geometries.length; ++k) {
                if (newControls[j].configuration.geometries[k].hiddenValues === undefined) {
                  newControls[j].configuration.geometries[k].hiddenValues = []
                }            
              }
            }
          }
          newModelList[i].controls = newControls;
      }
      state.modelList = newModelList;
    },
    setActiveModelGUID: (state, action) => {
      state.activeModelGUID = action.payload;
    },
    createModel: (state) => {
      let newGuid = Math.floor(Math.random() * Math.floor(99999999999999999999999999999999999999999))
      state.modelList.push({
        ...defaultModel,
        guid: newGuid,
      })
      state.activeModelGUID = newGuid
    },
    setIsInitialModel: (state, action) => {
      for (let i=0; i<state.modelList.length; ++i) {
        if (state.modelList[i].guid === state.activeModelGUID) {
          state.modelList[i].isInitial = action.payload;
        }
      }
    },
  },
});

export const { 
  resetState,
  setModelId, 
  setModelName,
  createControl, 
  toggleDisableButtons,
  updateControl,
  setControls,
  setTextureControls,
  addTextureControls,
  setSceneGraph,
  setSceneGraphIsVisible,
  setViewMode,
  setUnselectedGeometries,
  setSurfaceOptionMap,
  setSurfaceConfigurationMode,
  setAllNodesVisible,
  setAnimations,
  setMaterials,
  setSketchfabAPI,
  setModelList,
  setActiveModelGUID,
  createModel,
  setIsInitialModel,
} = viewerSlice.actions;

export const getAttributeFromModel = (state, attribute) => {
  
  for (let i=0; i<state.modelList.length; ++i) {
    if (state.modelList[i].guid === state.activeModelGUID) {
      return state.modelList[i][attribute]
    }
  }
}

export const selectModelList = state => state.modelList;

export const selectActiveModelGUID = state => state.activeModelGUID;

export const selectModelId = state => getAttributeFromModel(state, "uid");

export const selectMaterials = state => getAttributeFromModel(state, "materials")

export const selectAnimations = state => getAttributeFromModel(state, "animations");

export const selectControls = state => getAttributeFromModel(state, "controls");

export const selectTextureControls = state => getAttributeFromModel(state, "textureControls");

export const selectDisableButtons = state => state.disableButtons;

export const selectSceneGraph = state => getAttributeFromModel(state, "sceneGraph");

export const selectSketchfabAPI = state => state.sketchfabAPI;

export const selectSceneGraphIsVisible = state => getAttributeFromModel(state, "sceneGraphIsVisible");

export const selectViewMode = state => state.viewMode;

export const selectSurfaceOptionMap = state => getAttributeFromModel(state, "surfaceOptionMap");

export const selectSurfaceConfigurationMode = state => getAttributeFromModel(state, "surfaceConfigurationMode");

export const selectGeometryCategoryOptions = state => getAttributeFromModel(state, "geometryCategoryOptions");

export const toggleImportModalDisplay = ()  => dispatch => {
  const modal = document.getElementById("import-modal")

  const currentStyle = modal.style.display;
  if (currentStyle === 'block') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
  }   
}

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
