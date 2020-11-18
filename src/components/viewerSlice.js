import { createSlice } from '@reduxjs/toolkit';
import Sketchfab from '@sketchfab/viewer-api';

const initialState = {
  modelId: '',
  materials: [],
  animations: [],
  sceneGraph: [],
  controls: [],
  disableButtons: true,
  latestControlId: 0,
  isPreviewMode: false,
};

export const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    resetState: state => {
      state = initialState;
    },
    setIsPreviewMode: (state, action) => {
      state.isPreviewMode = action.payload;
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
    },
    createControl: (state, action) => {
      state.latestControlId = state.latestControlId += 1;
      let id = state.latestControlId;
      state.controls.unshift({
        type: action.payload,
        id: id,
        name: action.payload,
        entityIndex: 0,
        entity: {instanceID: 0},
      });
    },
    setControls: (state, action) => {
      state.controls = action.payload;
    },
    toggleDisableButtons: (state) => {
      state.disableButtons = false;
    },
    updateControl: (state, action) => {
      const { id, key, value } = action.payload;
      for (let i=0; i<state.controls.length; ++i) {
        if (state.controls[i].id == id) {
          state.controls[i][key] = value;
        }
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
  setIsPreviewMode,
} = viewerSlice.actions;

export const selectIsPreviewMode = state => state.viewer.isPreviewMode;

export const selectModelId = state => state.viewer.modelId;

export const selectMaterials = state => state.viewer.materials;

export const selectAnimations = state => state.viewer.animations;

export const selectControls = state => state.viewer.controls;

export const selectDisableButtons = state => state.viewer.disableButtons;

export const selectSceneGraph = state => state.viewer.sceneGraph;

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

export const initializeViewer = modelId => dispatch => {

  dispatch(viewerSlice.actions.setControls([]));

  var iframe = document.getElementById('api-frame');
  var version = '1.8.2';
  var DEFAULT_URLID = 'c632823b6c204797bd9b95dbd9f53a06';
  var DEFAULT_PREFIX = 'seat ';		
  
  var CONFIG = {
      urlid: modelId !== '' ? modelId : DEFAULT_URLID,
      prefix: DEFAULT_PREFIX
  };
  var isSeeking;
  var animationsList = [];
  var current_anim;
  var apiSkfb;
  var pollTime, duration;
  var timeSlider;

  pollTime = function() {
        apiSkfb.getCurrentTime(function(err, time) {
            if (!isSeeking) {
                var percentage = (100 * time) / duration;
                timeSlider.value = percentage;
                                    
                var timeDisplay = document.getElementById('timeDisplay');
                timeDisplay.innerHTML = time.toFixed(2);
                if (time == 2) {
                  apiSkfb.seekTo(1);
                }
            }
            requestAnimationFrame(pollTime);
        });
  };

  var Configurator = {
      api: null,
      config: null,
      options: [],

      init: function (config, iframe) {
          this.config = config;
          var client = new Sketchfab(version, iframe);
          client.init(config.urlid, {
              ui_infos: 0,
              ui_controls: 0,
              graph_optimizer: 0,
              success: function onSuccess(api) {
                  var controls = document.getElementById('animationControls');
                  var buttonsText = `
                      <div style="display: flex; justify-content: center;">
                        <p id="timeDisplay"></p>
                        <p id="animationName" style="margin-left: 50px;"></p>
                      </div>
                      <button id="play">Play</button>
                      <button id="pause">Pause</button>
                      <button id="previous">Previous</button>
                      <button id="next">Next</button>
                      <input 
                        id="timeSlider" 
                        class="slider timeSlider" 
                        style="width:100%" 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="0.1" 
                        value="0"
                      />
                  `;
              
                  controls.innerHTML = buttonsText;

                  apiSkfb = api;
                  api.start();
                  api.addEventListener('viewerready', function () {
                      this.api = api;

                      api.getAnimations(function(err, animations) {
                          console.log(animations);          
                          animationsList = animations;

                          dispatch(viewerSlice.actions.setAnimations(animations));

                          if (animations.length == 0) {                            
                              var controls = document.getElementById('animationControls');
                              controls.innerHTML = "";
                          } else {  
                              document.getElementById('pause').addEventListener('click', function() {
                                  api.pause();
                              });
    
                              document.getElementById('play').addEventListener('click', function() {
                                  api.play();
                              });
    
                              document.getElementById('previous').addEventListener('click', function() {
                                  if (current_anim === 0) current_anim = animationsList.length;
                                  current_anim--;
                  
                                  api.setCurrentAnimationByUID(animationsList[current_anim][0]);
                                  api.seekTo(0);
                                  duration = animationsList[current_anim][2];
                                  var animationName = document.getElementById('animationName');
                                  animationName.innerHTML = animationsList[current_anim][1];
                  
                                  console.log(duration);
                              });
                  
                              document.getElementById('next').addEventListener('click', function() {
                                  current_anim++;
                                  if (current_anim === animationsList.length) current_anim = 0;
                  
                                  api.setCurrentAnimationByUID(animationsList[current_anim][0]);
                                  api.seekTo(0);
                                  duration = animationsList[current_anim][2];
                                  var animationName = document.getElementById('animationName');
                                  animationName.innerHTML = animationsList[current_anim][1];
                  
                                  console.log(duration);
                              });

                              var animationName = document.getElementById('animationName');
                              animationName.innerHTML = animationsList[0][1];
                              current_anim = 0;
                              api.setCurrentAnimationByUID(animations[current_anim][0]);
                              duration = animations[current_anim][2];
                              isSeeking = false;
                              timeSlider = document.getElementById('timeSlider');
                              pollTime();
          
                              timeSlider.addEventListener('change', function() {
                                  isSeeking = false;

                                  var time = (duration * timeSlider.value) / 100;
                                  var timeDisplay = document.getElementById('timeDisplay');
                                  timeDisplay.innerHTML = time.toFixed(2);
                              });
          
                              timeSlider.addEventListener('input', function() {
                                  isSeeking = true;
                                  var time = (duration * timeSlider.value) / 100;
                                  var timeDisplay = document.getElementById('timeDisplay');
                                  timeDisplay.innerHTML = time.toFixed(2);
                                  api.pause();
                                  api.seekTo(time);
                              });
                          }
                      });

                      dispatch(viewerSlice.actions.toggleDisableButtons());
                      api.getSceneGraph(function(err, result) {
                          if (err) {
                              console.log('Error getting nodes');
                              return;
                          }                  
                          dispatch(viewerSlice.actions.setSceneGraph(result))        
                      });

                      api.getMaterialList(function(err, materials) {
                          dispatch(viewerSlice.actions.setMaterials(materials));
          
                          for (var i = 0; i < materials.length; i++) {
                              var m = materials[i];
                              console.log(m.name, m);
                          }
                      });
                  }.bind(this));
              }.bind(this),
              error: function onError() {
                  console.log('Viewer error');
              }
          });
      }
  }

  Configurator.init(CONFIG, iframe);
};

var buildSceneGraph = function(state, children, depth) {
	for (let i=0; i<children.length; ++i) {
		if(children[i].name == undefined) {
			state.sceneGraph.push({name: children[i].type, depth: depth, instanceID: children[i].instanceID});
		} else {
			state.sceneGraph.push({name: children[i].name, depth: depth, instanceID: children[i].instanceID});
		}
		if (children[i].children != undefined || children[i].children != null) {			
			buildSceneGraph(state, children[i].children, depth+1);
		}
	}
}

export default viewerSlice.reducer;
