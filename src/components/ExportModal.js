import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
	toggleModalDisplay, 
	selectControls, 
	selectSceneGraph, 
	selectModelId,
	selectGroupingOptions,
} from './viewerSlice';

export default () => {

    const dispatch = useDispatch();
	const controls = useSelector(selectControls);
	const modelId = useSelector(selectModelId);
	const sceneGraph = useSelector(selectSceneGraph);
	const groupingOptions = useSelector(selectGroupingOptions);

    return (
        <div id="modal">
            <div className="modal__content">
                <span class="close"
                    onClick={() => dispatch(toggleModalDisplay())}>&times;</span>
                <div className="modal__header">
                    <h1>Add This To Your Page</h1>
                </div>
                <textarea id="js-output" value={createJSExport(controls, modelId, sceneGraph, groupingOptions)} />
            </div>
        </div>
    )
}

const createJSExport = (controls, modelId, sceneGraph, groupingOptions) => (
`
// Sketchfab Viewer API: Change Texture/material
var version = '1.8.2';
var uid = '${modelId}';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var myMaterials;

var error = function() {
	console.error('Sketchfab API error');
};

var controls = ${JSON.stringify(controls)}

var sceneGraph = ${JSON.stringify(sceneGraph)}

var groupingOptions = ${JSON.stringify(groupingOptions)}

var animationObjects = {};

var controlsContainer = document.getElementById('controls');
var toggleableItems = {};
var toggleableGroups = {};

var nameArrays = [];
var currentAnimation = "";
var currentAnimationEndTime = 0;
var groupingMode = false;
var firstGroupingControlIndex = -1;

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

var apiSkfb, pollTime;


pollTime = function() {
        apiSkfb.getCurrentTime(function(err, time) {
			
			if (currentAnimationEndTime > 0 && time >= currentAnimationEndTime) {
				apiSkfb.pause();
			}
            requestAnimationFrame(pollTime);
        });
  };

var success = function(api) {
    apiSkfb = api;
	api.start(function() {
		api.addEventListener('viewerready', function() {
			pollTime();
			api.pause();
            api.getSceneGraph(function(err, result) {
                if (err) {
                    console.log('Error getting nodes');
                    return;
                }
				var sceneElements = [];
				getName(result.children, 0);
            });
			
			api.getMaterialList(function(err, materials) {
				myMaterials = materials;
			});
			
			var animations = [];
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
				} else if (controls[i].type == "grouping") {			
					groupingMode = true;
					if (firstGroupingControlIndex == -1) {
						firstGroupingControlIndex = i;
					}
					var groupingsContainer = document.createElement("div");
					groupingsContainer.style.display = "flex";
					
					for (var j=0; j<controls[i].groupings.length; ++j) {
						var groupingDiv = document.createElement("div");
						var groupingTitle = document.createElement("label");
						groupingTitle.style.marginRight = "10px";
						groupingTitle.style.marginLeft = "10px";
						
						groupingTitle.innerHTML = controls[i].groupings[j].name + ":";
						var groupingSelect = document.createElement("select");
						groupingSelect.classList.add("grouping__select");
						groupingSelect.id = i + "select" + j;
						
						groupingSelect.addEventListener("change", function(e) {
							var startButton = document.getElementById("startButton");
							var pauseButton = document.getElementById("pauseButton");
							var animationSelect = document.getElementById("animationSelect");
							
							var allGroupingSelects = document.getElementsByClassName("grouping__select");
							var allDesignationsSet = true;
							var selectedPrefixes = [];
							var disableAnimation = false;
							for (var k=0; k<allGroupingSelects.length; ++k) {
								if (allGroupingSelects[k].value == "none") {
									allDesignationsSet = false;
								}
								selectedPrefixes.push(allGroupingSelects[k].value);
								var indexes = allGroupingSelects[k].id.split("select")
								var indexI = indexes[0];
								var indexJ = indexes[1];
								
								if(controls[indexI].groupings[indexJ].allowsAnimation.indexOf(allGroupingSelects[k].value) == -1) {
									disableAnimation = true;
								}								
							}
							startButton.disabled = disableAnimation || animationSelect.value == "none";
							pauseButton.disabled = disableAnimation || animationSelect.value == "none";
							animationSelect.disabled = disableAnimation;
							
							if (allDesignationsSet) {								
								var primaryLetterCode = "";
								for (var k=0; k<groupingOptions.length; ++k) {
									if (groupingOptions[k].designation == allGroupingSelects[0].value) {
										primaryLetterCode = groupingOptions[k].capitalLetter;
									}
								}
								
								for (var k=0; k<allGroupingSelects.length; ++k) {
									selectedPrefixes.push(allGroupingSelects[k].value);
								}
								
								for (var k=0; k<sceneGraph.length; ++k) {
									var nodeNameArray = sceneGraph[k].name.split("-")
									var mainDesignation = nodeNameArray[0];
									var letterCode = nodeNameArray[1];
									
									api.hide(sceneGraph[k].instanceID);
									
									if (selectedPrefixes.indexOf(mainDesignation) > -1 && 
											letterCode.includes(primaryLetterCode)) {
										api.show(sceneGraph[k].instanceID);											
									}
								}								
							}
						});
						
						for (var k=0; k<controls[i].groupings[j].designations.length; ++k) {
							var designationOption = document.createElement("option");
							designationOption.value = controls[i].groupings[j].designations[k];
							designationOption.innerHTML = controls[i].groupings[j].designations[k];
							groupingSelect.appendChild(designationOption);
						}						
						
						groupingDiv.appendChild(groupingTitle);
						groupingDiv.appendChild(groupingSelect);
						groupingsContainer.appendChild(groupingDiv);
					}
					singleControlContainer.appendChild(groupingsContainer);
				}
				controlsContainer.appendChild(singleControlContainer);
			}
			
			if (animations.length > 0) {
				var singleControlContainer = document.createElement("div");
				var controlTitle = document.createElement("h3");
				controlTitle.innerHTML = "Animations";  
				singleControlContainer.classList.add("single-control-container");					
				
				singleControlContainer.appendChild(controlTitle);
				
				var startBut = document.createElement("button");
				startBut.id = "startButton";
				startBut.innerHTML = "Start";
				startBut.disabled = true;
				startBut.onclick = function() {
				    var startTime = animationObjects[currentAnimation].startTime;
					api.seekTo(startTime);
					api.play();
				}
				var pauseBut = document.createElement("button");
				pauseBut.id = "pauseButton";
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
						currentAnimationEndTime = endTime;
						
					} else {						
						startBut.disabled = true;
						pauseBut.disabled = true;
					}
				});
				
				singleControlContainer.appendChild(animationSelect);
				controlsContainer.appendChild(singleControlContainer);
			}
			
			//show/hide to OG specification
			if (groupingMode) {
				var startButton = document.getElementById("startButton");
				var pauseButton = document.getElementById("pauseButton");
				var animationSelect = document.getElementById("animationSelect");
				
				var allGroupingSelects = document.getElementsByClassName("grouping__select");
				var allDesignationsSet = true;
				var selectedPrefixes = [];
				var disableAnimation = false;		
				var primaryLetterCode = "";
				for (var k=0; k<groupingOptions.length; ++k) {
					if (groupingOptions[k].designation == allGroupingSelects[0].value) {
						primaryLetterCode = groupingOptions[k].capitalLetter;
					}
				}
				for (var k=0; k<allGroupingSelects.length; ++k) {
					if (allGroupingSelects[k].value == "none") {
						allDesignationsSet = false;
					}
					selectedPrefixes.push(allGroupingSelects[k].value);
					var indexes = allGroupingSelects[k].id.split("select")
					var indexI = indexes[0];
					var indexJ = indexes[1];
					
					if(controls[indexI].groupings[indexJ].allowsAnimation.indexOf(allGroupingSelects[k].value) == -1) {
						disableAnimation = true;
					}								
				}
				startButton.disabled = disableAnimation;
				pauseButton.disabled = disableAnimation;
				animationSelect.disabled = disableAnimation;
				
				for (var i=0; i<sceneGraph.length; ++i) {
					var nodeNameArray = sceneGraph[i].name.split("-")
					var mainDesignation = nodeNameArray[0];
					var letterCode = nodeNameArray[1];
					
					api.hide(sceneGraph[i].instanceID);
					
					if (selectedPrefixes.indexOf(mainDesignation) > -1 && 
							letterCode.includes(primaryLetterCode)) {
						api.show(sceneGraph[i].instanceID);											
					}
				}		
			}			
		});
	});
};

client.init(uid, {
	success: success,
	error: error,
	autostart: 1,
	preload: 1
});
  

`
)
