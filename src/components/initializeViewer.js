import Sketchfab from '@sketchfab/viewer-api';
import {
    setSketchfabAPI,
    setAnimations,
    setControls,
    toggleDisableButtons,
    setSceneGraph,
    setMaterials,
    setMaterialNameSegmentMap,
    setSurfaceOptionMap,
    setSurfaceAttributeNameMap,
} from './viewerSlice';

export default modelId => dispatch => {
    console.log("\n\ndispatch:")
    console.log(dispatch)

    dispatch(setControls([]));
  
    var iframe = document.getElementById('api-frame');
    var version = '1.8.2';
    var DEFAULT_URLID = 'f373c5bab8e7489fa12db2071471fe4e';
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
                requestAnimationFrame(pollTime);
              }
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
                ui_controls: 0,
                graph_optimizer: 0,
                ui_animations: 0,
                ui_watermark: 0,
                ui_inspector: 0,
                ui_stop: 0,
                ui_infos: 0,
  
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
                    dispatch(setSketchfabAPI(api));
                    api.start();
                    api.addEventListener('viewerready', function () {
                        this.api = api;
                        api.pause();
  
                        api.getAnimations(function(err, animations) {
                            animationsList = animations;
  
                            dispatch(setAnimations(animations));
  
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
                                });
                    
                                document.getElementById('next').addEventListener('click', function() {
                                    current_anim++;
                                    if (current_anim === animationsList.length) current_anim = 0;
                    
                                    api.setCurrentAnimationByUID(animationsList[current_anim][0]);
                                    api.seekTo(0);
                                    duration = animationsList[current_anim][2];
                                    var animationName = document.getElementById('animationName');
                                    animationName.innerHTML = animationsList[current_anim][1];
                                });
  
                                var animationName = document.getElementById('animationName');
                                animationName.innerHTML = animationsList[0][1];
                                current_anim = 0;
                                api.setCurrentAnimationByUID(animations[current_anim][0]);
                                duration = animations[current_anim][2];
                                isSeeking = false;
                                timeSlider = document.getElementById('timeSlider');
            
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
                                
                                pollTime();
                            }
                        });
  
                        
                        dispatch(toggleDisableButtons());
                        
                        api.getSceneGraph(function(err, result) {
                            if (err) {
                                console.log('Error getting nodes');
                                return;
                            }                  
                            dispatch(setSceneGraph(result))        
                        });
  
                        api.getMaterialList(function(err, materials) {
                            dispatch(setMaterials(materials));
  
                            let surfaceOptionMap = {};
                            let materialNameSegmentMap = {};
                            let surfaceAttributeNameMap = {};
                            
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
  
                                  surfaceAttributeNameMap[geometryName] = ["Attribute Name"]
                                  surfaceOptionMap[geometryName][materialOptions[0]] = [];
                                  for (let j=1; j<materialOptions.length; ++j) {
                                    surfaceAttributeNameMap[geometryName].push("Attribute Name")
                                    surfaceOptionMap[geometryName][primaryValue].push([materialOptions[j]])
                                  }
                                } else {
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
                            
                            dispatch(setMaterialNameSegmentMap(materialNameSegmentMap))
                            dispatch(setSurfaceOptionMap(surfaceOptionMap))
                            dispatch(setSurfaceAttributeNameMap(surfaceAttributeNameMap))
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
