import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
	toggleModalDisplay, 
	selectControls, 
	selectSceneGraph, 
	selectModelId,
	selectSurfaceOptionMap,
	selectSurfaceConfigurationMode,
	selectMaterialNameSegmentMap,
	selectSurfaceAttributeNameMap,
	selectGroupingOptions,
} from './viewerSlice';

export default () => {

    const dispatch = useDispatch();
	const controls = useSelector(selectControls);
	const modelId = useSelector(selectModelId);
	const sceneGraph = useSelector(selectSceneGraph);
	const surfaceOptionMap = useSelector(selectSurfaceOptionMap);
	const surfaceConfigurationMode = useSelector(selectSurfaceConfigurationMode)
	const materialNameSegmentMap = useSelector(selectMaterialNameSegmentMap)
	const surfaceAttributeNameMap = useSelector(selectSurfaceAttributeNameMap)
	const groupingOptions = useSelector(selectGroupingOptions);

	const configurationMaps = {
		controls, 
		modelId, 
		sceneGraph, 
		surfaceOptionMap, 
		surfaceConfigurationMode,
		materialNameSegmentMap,
		surfaceAttributeNameMap,
		groupingOptions,		
	}

    return (
        <div id="modal">
            <div className="modal__content">
                <span class="close"
                    onClick={() => dispatch(toggleModalDisplay())}>&times;</span>
                <div className="modal__header">
                    <h1>Add This To Your Page</h1>
                </div>
                <textarea id="js-output" value={createJSExport(configurationMaps)} />
            </div>
        </div>
    )
}

const createJSExport = (configurationMaps) => {
	const {
		controls, 
		modelId, 
		sceneGraph, 
		surfaceOptionMap, 
		surfaceConfigurationMode,
		materialNameSegmentMap,
		surfaceAttributeNameMap,
		groupingOptions,	
	} = configurationMaps;

	return (
`
// Sketchfab Viewer API: Change Texture/material
var version = '1.8.2';
var uid = '${modelId === '' ? 'f373c5bab8e7489fa12db2071471fe4e' : modelId}';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var myMaterials;

var error = function() {
	console.error('Sketchfab API error');
};

var controls = ${JSON.stringify(controls)}

var sceneGraph = ${JSON.stringify(sceneGraph)}

var groupingOptions = ${JSON.stringify(groupingOptions)}

var surfaceConfigurationMode = ${surfaceConfigurationMode};
var surfaceOptionMap = ${JSON.stringify(surfaceOptionMap)};
var materialNameSegmentMap = ${JSON.stringify(materialNameSegmentMap)};
var surfaceAttributeNameMap = ${JSON.stringify(surfaceAttributeNameMap)};

var animationObjects = {};

var controlsContainer = document.getElementById('controls');
var toggleableItems = {};
var toggleableGroups = {};

var nameArrays = [];
var currentAnimation = "";
var currentAnimationEndTime = 0;
var isElementCategoryControlled = false;
var firstGroupingControlIndex = -1;

var appContainer = document.querySelector("div.app")
appContainer.style.display = "block"

var apiSkfb, pollTime;

var buildNodeNameArray = function(children, depth) {
	for (let i=0; i<children.length; ++i) {
		if(children[i].name == undefined) {
			nameArrays.push({name: children[i].type, depth: depth, instanceID: children[i].instanceID});
		} else {
			nameArrays.push({name: children[i].name, depth: depth, instanceID: children[i].instanceID});
		}
		if (children[i].children != undefined || children[i].children != null) {			
			buildNodeNameArray(children[i].children, depth+1);
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

var globalTestMaterialID = "";
var success = function(api) {
    apiSkfb = api;
	api.start(function() {
		api.addEventListener('viewerready', function() {
			api.pause();
            api.getSceneGraph(function(err, result) {
                if (err) {
                    console.log('Error getting nodes');
                    return;
                }
				buildNodeNameArray(result.children, 0);
				console.log("sceneGraph[0]:")
				console.log(result);
            });
			
			api.getMaterialList(function(err, materials) {
				myMaterials = materials;
				if (surfaceConfigurationMode) {
					configureInitialSurfaces(api)
				}
			});
			
			var animations = [];
			for (let i = 0; i < controls.length; ++i) {	
				if (controls[i].type == "animation") {
					var animationControls = document.getElementById("animation-controls")
					animationControls.style.display = "block";
					
					var animationButtonContainer = document.getElementById("animation-buttons")
					var animationButton = document.createElement("button")
					animationButton.id = "animation-" + controls[i].id
					animationButton.textContent = controls[i].name;
					animationButton.addEventListener('click', function(e) {
						var animationId = e.target.id.split("-")[1]
						var startTime = animationObjects[animationId].startTime;
						var endTime = animationObjects[animationId].endTime;
						var animationUID = animationObjects[animationId].uid;
						currentAnimationEndTime = endTime;
						api.setCurrentAnimationByUID(animationUID);
						api.seekTo(startTime);
						api.play();
					})
					animationButtonContainer.appendChild(animationButton)
					
					animations.push(controls[i]);
					animationObjects[controls[i].id] = {name: controls[i].name, startTime: Number(controls[i].configuration.startTime), endTime: Number(controls[i].configuration.endTime), uid: controls[i].configuration.animationUID}; 
					continue;
				}
				if (controls[i].type == "surfaceConfiguration") {
					continue;
				}
				var singleControlContainer = document.createElement("div");
				singleControlContainer.classList.add("single-control-container");		
											
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
					isElementCategoryControlled = true;
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
									var indexContainingCodes = k;
									if (sceneGraph[k].name === "MatrixTransform") {
										indexContainingCodes = k - 1;
									}
									
									var nodeNameArray = sceneGraph[indexContainingCodes].name.split("-")
									var mainDesignation = nodeNameArray[0];
									var letterCode = nodeNameArray[1];
									
									api.hide(sceneGraph[indexContainingCodes].instanceID);
									
									if (selectedPrefixes.indexOf(mainDesignation) > -1 && 
											letterCode.includes(primaryLetterCode)) {
										
										api.show(sceneGraph[indexContainingCodes].instanceID);											
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
				} else if (controls[i].type === "category") {	
					isElementCategoryControlled = true;
					
					var wrapper = document.createElement("div")
					wrapper.classList.add("custom-select-wrapper")
					var select = document.createElement("div")
					select.classList.add("custom-select")
					var selectTrigger = document.createElement("div")
					selectTrigger.classList.add("custom-select__trigger")
					var triggerSpan = document.createElement("span")
					if (controls[i].configuration.isPrimary == true) {
						triggerSpan.id = "primaryCategory";
					}
					triggerSpan.textContent = Object.keys(controls[i].configuration.designations)[0]
					triggerSpan.id = "triggerSpan-" + i;
					selectTrigger.appendChild(triggerSpan)
					var arrow = document.createElement("div")
					arrow.classList.add("arrow")
					selectTrigger.appendChild(arrow)
					
					var customOptions = document.createElement("div")
					customOptions.classList.add("custom-options")
					var selectTitle = document.createElement("h3")
					selectTitle.classList.add("select-title")
					selectTitle.textContent = controls[i].name;
					customOptions.appendChild(selectTitle)
					
					select.appendChild(selectTrigger)
					select.appendChild(customOptions)
					wrapper.appendChild(select)	
					
					for (var j=0; j<Object.keys(controls[i].configuration.designations).length; ++j) {
						
						let customOption = document.createElement("span")
						customOption.classList.add("custom-option");
						if (j===0) {
							customOption.classList.add("selected");
						}
						var name = Object.keys(controls[i].configuration.designations)[j];
						var humanReadable = Object.values(controls[i].configuration.designations)[j]
						customOption.setAttribute("data-value", name)
						customOption.id = name + "-" + j + "-" + i;
						customOption.innerHTML = name + " - " + humanReadable;
						customOption.addEventListener('click', function() {
							var nameCode = this.id.split("-")[0]
							if (!this.classList.contains('selected')) {
								
								this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
								this.classList.add('selected');
								this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = nameCode;								
							}
							
							var indexI = this.id.split("-")[2]
							var animationButtons = document.querySelectorAll("#animation-buttons button")
							for (var k=0; k<animationButtons.length; ++k) {
								animationButtons[k].disabled = true;
							}
							if(controls[indexI].configuration.allowsAnimation.indexOf(nameCode) != -1) {
								for (var k=0; k<animationButtons.length; ++k) {
									animationButtons[k].disabled = false;
								}
							}	
						})
						
						customOptions.appendChild(customOption)
					}

					wrapper.addEventListener('click', function() {
						this.querySelector('.custom-select').classList.toggle('open');	
						
						var allCategorySelects = document.querySelectorAll(".custom-select__trigger span")
						var selectedPrefixes = [];
						var primaryLetterCode = "";
						
						for (var j=0; j<allCategorySelects.length; ++j) {
							selectedPrefixes.push(allCategorySelects[j].textContent);
							if(allCategorySelects[j].id === "primaryCategory") {
								primaryLetterCode = groupingOptions[j].capitalLetter;
							}
						}
						
						for (var j=0; j<sceneGraph.length; ++j) {
							var indexContainingCodes = j;
							if (sceneGraph[j].name === "MatrixTransform") {
								indexContainingCodes = j - 1;
							}
							
							var nodeNameArray = sceneGraph[indexContainingCodes].name.split("-")
							var mainDesignation = nodeNameArray[0];
							var letterCode = nodeNameArray[1];
							
							api.hide(sceneGraph[indexContainingCodes].instanceID);
							
							if (selectedPrefixes.indexOf(mainDesignation) > -1 && 
									letterCode.includes(primaryLetterCode)) {
								
								api.show(sceneGraph[indexContainingCodes].instanceID);											
							}
						}		
					})
					
					singleControlContainer.appendChild(wrapper);		
				}
				controlsContainer.appendChild(singleControlContainer);
			}
			
			//show/hide to OG specification
			if (isElementCategoryControlled) {
				window.addEventListener('click', function(e) {
					for (const select of document.querySelectorAll('.custom-select')) {
						if (!select.contains(e.target)) {
							select.classList.remove('open');
						}
					}
				});
				
				var allCategorySelects = document.querySelectorAll(".custom-select__trigger span")
				var selectedPrefixes = [];
				
				for (var i=0; i<allCategorySelects.length; ++i) {
					selectedPrefixes.push(allCategorySelects[i].textContent);
				}
									
				var primaryLetterCode = "";
				
				for (var i=0; i<allCategorySelects.length; ++i) {
					selectedPrefixes.push(allCategorySelects[i].value);
					if(allCategorySelects[i].id === "primaryCategory") {
						primaryLetterCode = groupingOptions[i].capitalLetter;
					}
					var controlIndex = allCategorySelects[i].id.split("-")[1]
					var nameCode = allCategorySelects.textContent;
					var animationButtons = document.querySelectorAll("#animation-buttons button")
					for (var k=0; k<animationButtons.length; ++k) {
						animationButtons[k].disabled = true;
					}
					if (controls[controlIndex].configuration.allowsAnimation.indexOf(nameCode) != -1) {
						for (var k=0; k<animationButtons.length; ++k) {
							animationButtons[k].disabled = false;
						}
						
					}
				}
				
				for (var i=0; i<sceneGraph.length; ++i) {
					var indexContainingCodes = i;
					if (sceneGraph[i].name === "MatrixTransform") {
						indexContainingCodes = i - 1;
					}
					
					var nodeNameArray = sceneGraph[indexContainingCodes].name.split("-")
					var mainDesignation = nodeNameArray[0];
					var letterCode = nodeNameArray[1];
					
					api.hide(sceneGraph[indexContainingCodes].instanceID);
					
					if (selectedPrefixes.indexOf(mainDesignation) > -1 && 
							letterCode.includes(primaryLetterCode)) {
						
						api.show(sceneGraph[indexContainingCodes].instanceID);											
					}
				}		
			}
			
			if (animations.length > 0) {
				pollTime();			
			}
			
			if (surfaceConfigurationMode) {
				var singleControlContainer = document.createElement("div");
				for (var i=0; i<Object.keys(surfaceOptionMap).length; ++i) {
					var surfaceTitle = document.createElement("h4");
					var surfaceName = Object.keys(surfaceOptionMap)[i]
					surfaceTitle.innerHTML = surfaceName;
					singleControlContainer.appendChild(surfaceTitle);
				
					// generate primary Select
					var primarySelectTitle = document.createElement("h5");
					primarySelectTitle.innerHTML = surfaceAttributeNameMap[surfaceName][0];
					var primarySelect = document.createElement("select");
					primarySelect.classList.add(surfaceName + "-select");
					primarySelect.id = surfaceName + 0;
					var primaryOptions = Object.keys(surfaceOptionMap[surfaceName])
					var firstPrimaryOption = primaryOptions[0];
					for (var j=0; j<primaryOptions.length; ++j) {
						var optionName = materialNameSegmentMap[primaryOptions[j]]
						var primaryOption = document.createElement("option");
						primaryOption.value = primaryOptions[j];
						primaryOption.innerHTML = optionName;
						primarySelect.appendChild(primaryOption);
					}							

					primarySelect.addEventListener("change", function(e) {
						var currentSurfaceName = e.target.id.match(/[a-zA-Z]+/g)[0];						
						
						var relevantSelects = document.getElementsByClassName(currentSurfaceName + "-select")

						for (var j=0; j<surfaceAttributeNameMap[currentSurfaceName].length-1; ++j) {
							var attributeSelect = relevantSelects[j+1];
							attributeSelect.innerHTML = "";
							var attributeOptions = surfaceOptionMap[currentSurfaceName][e.target.value][j]
							
							for (var k=0; k<attributeOptions.length; ++k) {
								var optionName = materialNameSegmentMap[attributeOptions[k]]
								var attributeOption = document.createElement("option");
								attributeOption.value = attributeOptions[k];
								attributeOption.innerHTML = optionName;
								attributeSelect.appendChild(attributeOption);
							}							
						}
						configureMaterials(currentSurfaceName, api)
					});
					singleControlContainer.appendChild(primarySelectTitle);
					singleControlContainer.appendChild(primarySelect);
	
					for (var j=0; j<surfaceAttributeNameMap[surfaceName].length-1; ++j) {
						var attributeSelectTitle = document.createElement("h5");
						attributeSelectTitle.innerHTML = surfaceAttributeNameMap[surfaceName][j+1];
						var attributeSelect = document.createElement("select");
						attributeSelect.classList.add(surfaceName + "-select");
						attributeSelect.id = surfaceName + j;
						var attributeOptions = surfaceOptionMap[surfaceName][firstPrimaryOption][j]
						for (var k=0; k<attributeOptions.length; ++k) {
							var optionName = materialNameSegmentMap[attributeOptions[k]]
							var attributeOption = document.createElement("option");
							attributeOption.value = attributeOptions[k];
							attributeOption.innerHTML = optionName;
							attributeSelect.appendChild(attributeOption);
						}												

						attributeSelect.addEventListener("change", function(e) {
							var currentSurfaceName = e.target.id.match(/[a-zA-Z]+/g)[0];
							configureMaterials(currentSurfaceName, api);
						});
						singleControlContainer.appendChild(attributeSelectTitle);
						singleControlContainer.appendChild(attributeSelect);
					}
				}
				controlsContainer.appendChild(singleControlContainer);
			}
		});
	});
};

client.init(uid, {
	success: success,
	error: error,
	autostart: 1,
	preload: 1,
	ui_animations: 0,
	ui_watermark: 0,
	ui_inspector: 0,
	ui_stop: 0,
	ui_infos: 0,
});

var configureMaterials = function(currentSurfaceName, api) {
							
	var relevantSelects = document.getElementsByClassName(currentSurfaceName + "-select")

	var materialNameString = currentSurfaceName;
	for (var k=0; k<relevantSelects.length; ++k) {
		materialNameString += "-" + relevantSelects[k].value;
	}
	
	var newMaterial;
	for (var k=0; k<myMaterials.length; ++k) {
		if (myMaterials[k].name.startsWith(materialNameString)) {
			newMaterial = JSON.parse(JSON.stringify(myMaterials[k]));
		}
	}
	
	for (var k=0; k<myMaterials.length; ++k) {
		if (myMaterials[k].name === currentSurfaceName) {
			myMaterials[k].channels = JSON.parse(JSON.stringify(newMaterial.channels));
			myMaterials[k].reflection = newMaterial.reflection;
			myMaterials[k].reflector = newMaterial.reflector;
			myMaterials[k].shadeless = newMaterial.shadeless;
			api.setMaterial(myMaterials[k], function() {console.log("material updated")})
		}
	}
}

var configureInitialSurfaces = function(api) {
	
	var surfaceNames = Object.keys(surfaceOptionMap)				
	
	for (var i=0; i<surfaceNames.length; ++i) {
		var currentSurfaceName = surfaceNames[i];

		var firstPrimaryOption = Object.keys(surfaceOptionMap[currentSurfaceName])[0]
		var optionsArray = surfaceOptionMap[currentSurfaceName][firstPrimaryOption]
		var materialNameString = currentSurfaceName + "-" + firstPrimaryOption;
		
		
		for (var k=0; k<optionsArray.length; ++k) {
			materialNameString += "-" + optionsArray[0];
		}
		
		var newMaterial;
		for (var k=0; k<myMaterials.length; ++k) {
			if (myMaterials[k].name.startsWith(materialNameString)) {
				newMaterial = JSON.parse(JSON.stringify(myMaterials[k]));
			}
		}
		for (var k=0; k<myMaterials.length; ++k) {
			if (myMaterials[k].name === currentSurfaceName) {
				myMaterials[k].channels = JSON.parse(JSON.stringify(newMaterial.channels));
				myMaterials[k].reflection = newMaterial.reflection;
				myMaterials[k].reflector = newMaterial.reflector;
				myMaterials[k].shadeless = newMaterial.shadeless;
				api.setMaterial(myMaterials[k], function() {console.log("material updated")})
			}
		}
	}			
}






`
)
}
