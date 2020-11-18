import React from 'react';
import { useSelector } from 'react-redux';
import { selectControls } from './viewerSlice';
import Sketchfab from '@sketchfab/viewer-api';

export default () => {

    const controls = useSelector(selectControls);

    // Sketchfab Viewer API: Change Texture/material
    var version = '1.8.2';
    var uid = '7ad65ac6e08546548a774e5c4a646938';
    var iframe = document.getElementById('preview-frame');
    var client = new Sketchfab(version, iframe);
    
    var myMaterials;
    
    var error = function() {
        console.error('Sketchfab API error');
    };
    
    var animationObjects = {};
    
    var controlsContainer = document.getElementById('controls');
    var toggleableItems = {};
    
    var nameArrays = [];
    var currentAnimation = "";
    var controlButtons = [];
    
    var getName = function(children, depth) {
        for (let i=0; i<children.length; ++i) {
            if(children[i].name == undefined) {
                nameArrays.push({name: children[i].type, depth: depth, instanceID: children[i].instanceID});
            } else {
                nameArrays.push({name: children[i].name, depth: depth, instanceID: children[i].instanceID});
            }
            if (children[i].children != undefined || children[i].children != null) {			
                getName(children[i].children, depth+1);
            }
        }
    }
    
    var success = function(api) {
        api.start(function() {
            api.addEventListener('viewerready', function() {
                api.pause();
                api.getSceneGraph(function(err, result) {
                    if (err) {
                        console.log('Error getting nodes');
                        return;
                    }
                    
                    getName(result.children, 0);
                });
                
                api.getMaterialList(function(err, materials) {
                    myMaterials = materials;
                });
                
                var animations = [];
                /*
                for (let i = 0; i < controls.length; ++i) {	
                    if (controls[i].type == "animation") {
                        animations.push(controls[i]);
                        animationObjects[controls[i].id] = {name: controls[i].name, startTime: Number(controls[i].startTime), endTime: Number(controls[i].endTime), uid: controls[i].animationUID}; 
                        continue;
                    }
                    var singleControlContainer = document.createElement("div");
                    var controlTitle = document.createElement("h3");
                    controlTitle.innerHTML = controls[i].name;  
                    singleControlContainer.classList.add("single-control-container");					
                    
                    singleControlContainer.appendChild(controlTitle);
                                                
                    if (controls[i].type == "color") {
                        var resetBut = document.createElement("button");
                        resetBut.innerHTML = "Reset";
                        resetBut.onclick = function(e) {	
                            var m = myMaterials[controls[i].entityIndex];
                            m = JSON.parse(JSON.stringify(controls[i].entity));
                                
                            api.setMaterial(m);
                        }
                        singleControlContainer.appendChild(resetBut);
                        
                        for (let j = 0; j < controls[i].additionalColors.length; ++j) {
                            var colorBut = document.createElement("button");
    
                            colorBut.innerHTML = controls[i].additionalColors[j].name;
                            
                            colorBut.id = controls[i].id + "-" + controls[i].name
                            colorBut.onclick = function(e) {	
                                var m = myMaterials[controls[i].entityIndex];
                                m.channels.AlbedoPBR.factor = 1;
                                m.channels.AlbedoPBR.enable = true;
                                m.channels.AlbedoPBR.color = controls[i].additionalColors[j].colorRGB;
                                m.channels.AlbedoPBR.texture = null;
                                
                                m.channels.DiffuseColor.factor = 1;
                                m.channels.DiffuseColor.enable = true;
                                m.channels.DiffuseColor.color = controls[i].additionalColors[j].colorRGB;
                                m.channels.DiffuseColor.texture = null;
                                
                                m.channels.DiffusePBR.color = controls[i].additionalColors[j].colorRGB;
                                m.channels.DiffusePBR.enable = false;
                                m.channels.DiffusePBR.factor = 1;
                                
                                api.setMaterial(m);
                            }
                            singleControlContainer.appendChild(colorBut);
                        }	
                    } else if (controls[i].type == "toggle") {
                        toggleableItems[String(controls[i].entity.instanceID)] = "visible";
                        var toggleBut = document.createElement("button");
                        toggleBut.innerHTML = "Toggle " + controls[i].name;
                        toggleBut.id = controls[i].entity.instanceID;
                        toggleBut.onclick = function(e) {
                            var isVisible = toggleableItems[e.target.id];
                            if (isVisible == "visible") {
                                api.hide(e.target.id);
                                toggleableItems[String(controls[i].entity.instanceID)] = "hidden";
                            } else {
                                api.show(e.target.id);
                                toggleableItems[String(controls[i].entity.instanceID)] = "visible";
                            }
                        }
                        singleControlContainer.appendChild(toggleBut);
                    }
                    controlButtons.push(singleControlContainer);
                    //controlsContainer.appendChild(singleControlContainer);
                }
                if (animations.length > 0) {
                    var singleControlContainer = document.createElement("div");
                    var controlTitle = document.createElement("h3");
                    controlTitle.innerHTML = "Animations";  
                    singleControlContainer.classList.add("single-control-container");					
                    
                    singleControlContainer.appendChild(controlTitle);
                    
                    var startBut = document.createElement("button");
                    startBut.innerHTML = "Start";
                    startBut.disabled = true;
                    startBut.onclick = function() {
                        var startTime = animationObjects[currentAnimation].startTime;
                        api.seekTo(startTime);
                        api.play();
                    }
                    var pauseBut = document.createElement("button");
                    pauseBut.innerHTML = "Pause";
                    pauseBut.disabled = true;
                    pauseBut.onclick = function() {    
                        api.pause();
                    }
                    
                    singleControlContainer.appendChild(startBut);
                    singleControlContainer.appendChild(pauseBut);
                    
                    var animationSelect = document.createElement("select");
                    animationSelect.id = "animationSelect";
                    
                    var tempOption = document.createElement("option");
                    tempOption.value = "none";
                    tempOption.innerHTML = "Select An Animation";
                    
                    animationSelect.appendChild(tempOption);
                    for (let i=0; i<animations.length; ++i) {
                        if (i==0) {
                            currentAnimation = animations[i].id;
                        }
                        var tempOption = document.createElement("option");
                        tempOption.value = animations[i].id;
                        tempOption.innerHTML = animations[i].name;
                        
                        animationSelect.appendChild(tempOption);
                    }				
                    
                    animationSelect.addEventListener("change", function(e) {    
                        if (e.target.value != "none") {
                            startBut.disabled = false;
                            pauseBut.disabled = false;     
                            var animationUID = animationObjects[e.target.value].uid;
                            api.setCurrentAnimationByUID(animationUID);
                            var startTime = animationObjects[e.target.value].startTime;
                            currentAnimation = e.target.value;
                            api.seekTo(startTime);
                            var endTime = animationObjects[currentAnimation].endTime;
                            var duration = (endTime-startTime)*1000;
                            var sketchfabTimeFactor = 2;
                        
                            api.addEventListener('animationPlay', function() {
                                setTimeout(function(){ api.pause(); }, duration*sketchfabTimeFactor);
                            });
                        } else {						
                            startBut.disabled = true;
                            pauseBut.disabled = true;
                        }
                    });
                    
                    singleControlContainer.appendChild(animationSelect);
                    controlButtons.push(singleControlContainer);
                    //controlsContainer.appendChild(singleControlContainer);  
                }	
                */		
            });
        });
    };
    
    client.init(uid, {
        success: success,
        error: error,
        autostart: 1,
        preload: 1
    });
      

    return (
        <div className="app" style={{display: "flex"}}>	
            <div>
                <div className="viewer">
                    <iframe src="" id="preview-frame" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" width="640" height="480"></iframe>
                </div>
            </div>
            <div style={{display: "flex"}}>
                <div id="controls">
                    {controlButtons}
                </div>
            </div>	
        </div>
    )
}
