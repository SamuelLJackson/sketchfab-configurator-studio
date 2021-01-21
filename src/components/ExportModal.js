import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
	toggleModalDisplay, 
	selectControls, 
	selectModelId,
	selectSceneGraph, 
	selectMaterials,
	selectSurfaceOptionMap,
	selectSurfaceConfigurationMode,
	selectMaterialNameSegmentMap,
	selectHiddenCategoryConfigurations,
} from './viewerSlice';

const ExportModal = () => {

    const dispatch = useDispatch();
	const controls = useSelector(selectControls);
	const modelId = useSelector(selectModelId);
	const sceneGraph = useSelector(selectSceneGraph);
	const materials = useSelector(selectMaterials);
	const surfaceOptionMap = useSelector(selectSurfaceOptionMap);
	const surfaceConfigurationMode = useSelector(selectSurfaceConfigurationMode)
	const materialNameSegmentMap = useSelector(selectMaterialNameSegmentMap)
	const hiddenCategoryConfigurations = useSelector(selectHiddenCategoryConfigurations);

	const configurationMaps = {
		controls, 
		modelId, 
		sceneGraph, 
		materials,
		surfaceOptionMap, 
		surfaceConfigurationMode,
		materialNameSegmentMap,
		hiddenCategoryConfigurations,
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
		materials,
		surfaceOptionMap, 
		surfaceConfigurationMode,
		materialNameSegmentMap,
		hiddenCategoryConfigurations,
	} = configurationMaps;

	return (
`
// Sketchfab Viewer API: Change Texture/material
var version = '1.8.2';
var uid = '${modelId === '' ? '66e17931c39e4042ac5aa8764bee7f5a' : modelId}';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var myMaterials = ${JSON.stringify(materials)}

var error = function() {
	console.error('Sketchfab API error');
};

var controls = ${JSON.stringify(controls)}

var sceneGraph = ${JSON.stringify(sceneGraph)}

var hiddenCategoryConfigurations = ${JSON.stringify(hiddenCategoryConfigurations)}

var surfaceConfigurationMode = ${surfaceConfigurationMode};
var surfaceOptionMap = ${JSON.stringify(surfaceOptionMap)};
var materialNameSegmentMap = ${JSON.stringify(materialNameSegmentMap)};

var animationObjects = {};

var controlsContainer = document.getElementById('sketchfab-lower-controls');
var toggleableItems = {};
var toggleableGroups = {};

var currentAnimation = "";
var currentAnimationEndTime = 0;
var isElementCategoryControlled = false;
var firstGroupingControlIndex = -1;
var appContainer = document.querySelector("div.sketchfab__container")

var appWidth = Number(appContainer.style.width.replace("px",""))
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
			categorySelectObserver = new MutationObserver(function(mutationsList, categorySelectObserver) {
				setVisibleNodes(api);
			});
			
			api.pause();
			
			var animations = [];
			for (let i = 0; i < controls.length; ++i) {	
				if (controls[i].type == "animation") {
					var animationControls = document.getElementById("sketchfab-animation-controls")
					animationControls.style.display = "block";
					
					var animationButtonContainer = document.getElementById("sketchfab-animation-buttons")
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
				var singleControlContainer = document.createElement("div");
				singleControlContainer.classList.add("sketchfab-single-control-container");		
											
				
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
				} else if (controls[i].type === "geometryCategory") {	
					isElementCategoryControlled = true;
					
					var wrapper = initializeGeometrySelect(i);
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
					for (var j=0; j<controls[i].configuration.geometries.length; ++j) {
						
						let customOption = document.createElement("span")
						customOption.classList.add("sketchfab-option");
						if (j===0) {
							customOption.classList.add("selected");
						}
						var name = controls[i].configuration.geometries[j].designation;
						var humanReadable = controls[i].configuration.geometries[j].humanReadable;
						customOption.setAttribute("data-value", name)
						customOption.id = name + "-" + j + "-" + i;
						customOption.innerHTML = name + " - " + humanReadable;
						customOption.addEventListener('click', function(e) {
							handleUpdateSelect(e);
							var idArray = e.target.id.split("-")
							var optionName = idArray[0]
							var allCategoryOptions = document.querySelectorAll(".sketchfab-geometry-category .sketchfab-option")
							for (var k=0; k<allCategoryOptions.length; ++k) {
								allCategoryOptions[k].style.visibility = "visible";
							}
							var currentCategorySelections = Array.from(document.querySelectorAll(".sketchfab-geometry-category .sketchfab-select"))
													.filter(select => !select.classList.contains("sketchfab-select-open"))
													.map(select => select.querySelector(".sketchfab-select-value").textContent)
													
							currentCategorySelections.push(optionName)
							
							for (var k=0; k<currentCategorySelections.length; ++k) {
								var selectionName = currentCategorySelections[k];
								if (hiddenCategoryConfigurations[selectionName] !== undefined) {
									for (var l=0; l<hiddenCategoryConfigurations[selectionName].length; ++l) {
										var nameToHide = hiddenCategoryConfigurations[selectionName][l]
										var optionToHide = document.querySelector("[data-value='" + nameToHide + "']")
										optionToHide.style.visibility = "hidden"										
									}
									break;
								}
							}
							
							disableAnimations();
							handleHidingOptions(optionName);
						})
						
						customOptions.appendChild(customOption)
					}
					
					singleControlContainer.appendChild(wrapper);		
				} else if (controls[i].type === "textureCategory") {		
					const { geometryName, options, isPrimary, ordering } = controls[i].configuration
					
					var initialValue = options[0].name;
					var wrapper = initializeTextureSelect(geometryName, controls[i].name, initialValue)
					wrapper.classList.add("sketchfab-texture-category")
					wrapper.id = geometryName + "-" + ordering;
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
						for (var j=0; j<options.length; ++j) {
							let customOption = document.createElement("span")
							customOption.classList.add("sketchfab-option");
							if (j===0) {
								customOption.classList.add("selected");
							}
							const { name, humanReadable } = options[j];
							
							customOption.setAttribute("data-value", name)
							customOption.id = name + "-" + geometryName + "-" + j + "-" + j + "-" + i;
							customOption.innerHTML = name + " - " + humanReadable;
							customOption.addEventListener('click', e => {
								handleUpdateSelect(e);			
								handleHidingTextureOptions(api)
							})
								
							
							customOptions.appendChild(customOption)
						}
						singleControlContainer.appendChild(wrapper);
						
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
				controlsContainer.appendChild(singleControlContainer);
			}
			
			//show/hide to OG specification
			if (isElementCategoryControlled) {
				window.addEventListener('click', function(e) {
					for (const select of document.querySelectorAll('.sketchfab-select')) {
						if (!select.contains(e.target)) {
							select.classList.remove('sketchfab-select-open');
						}
					}
				});
				setVisibleNodes(api);
				handleHidingOptions();
				disableAnimations();
			}
			
			if (animations.length > 0) {
				pollTime();			
			}			
			
			if (surfaceConfigurationMode) {
				handleHidingTextureOptions(api)
			}
		});
	});
};

client.init(uid, {
	success: success,
	error: error,
	autostart: 0,
	preload: 0,
	ui_animations: 0,
	ui_watermark: 0,
	ui_inspector: 0,
	ui_stop: 0,
	ui_infos: 0,
});

var handleHidingTextureOptions = function(api) {
	console.log("BEGIN: handleHidingTextureOptions")
	
	var textureSelects = document.getElementsByClassName("sketchfab-texture-category")	
	for (var i=0; i<textureSelects.length; ++i) {
		var options = textureSelects[i].getElementsByClassName("sketchfab-option");
		var geometryName = textureSelects[i].id.split("-")[0]
		var ordering = textureSelects[i].id.split("-")[1]
		var isPrimary = Number(ordering) === 0;
		if (!isPrimary) {
			var currentInitialPrimarySelection = document.getElementById(geometryName + "-0").querySelector(".sketchfab-select__trigger span").textContent;
			var availableOptions = surfaceOptionMap[geometryName][currentInitialPrimarySelection][ordering-1]
			var previouslyAvailableOptions =  Array.from(options).filter(op => op.style.display === "block").map(op => op.getAttribute("data-value"))
			let equal = availableOptions.length == previouslyAvailableOptions.length && availableOptions.every((element, index)=> element === previouslyAvailableOptions[index] );
			
			var triggerSpan = textureSelects[i].querySelector(".sketchfab-select__trigger span")
			
			if (!equal) {
				var newValue = availableOptions[0];
				triggerSpan.textContent = newValue;
				for (var j=0; j<options.length; ++j) {
					options[j].classList.remove("selected")
					var optionValue = options[j].getAttribute("data-value")
					if (optionValue === newValue) {
						options[j].classList.add("selected")
					}
					options[j].style.display = "none"
					var optionValue = options[j].getAttribute("data-value")
					if (availableOptions.includes(optionValue)) {
						options[j].style.display = "block"
					}
				}
			}
		}
	}
	for (var i=0; i<textureSelects.length; ++i) {
		var geometryName = textureSelects[i].id.split("-")[0]
		configureMaterials(geometryName, api)		
	}

	console.log("END: handleHidingTextureOptions")
}

var configureMaterials = function(geometryName, api) {
	console.log("BEGIN: configureMaterials")
	console.log(arguments)
	//get array of selected values
	var relevantSelects = document.getElementsByClassName(geometryName + "-triggerSpan")
	console.log("relevantSelects:")
	console.log(relevantSelects)
	//build name string via accessing selected values
	var materialNameString = geometryName + "-";
	
	for (var k=0; k<relevantSelects.length; ++k) {
		materialNameString += relevantSelects[k].textContent + "-";
	}
	console.log("materialNameString:")
	console.log(materialNameString)
	var newMaterial;
	for (var k=0; k<myMaterials.length; ++k) {
		if (myMaterials[k].name.startsWith(materialNameString)) {
			newMaterial = JSON.parse(JSON.stringify(myMaterials[k]));
		}
	}
	console.log("newMaterial:")
	console.log(newMaterial)
	
	for (var k=0; k<myMaterials.length; ++k) {
		if (myMaterials[k].name === geometryName) {
			myMaterials[k].channels = JSON.parse(JSON.stringify(newMaterial.channels));
			myMaterials[k].reflection = newMaterial.reflection;
			myMaterials[k].reflector = newMaterial.reflector;
			myMaterials[k].shadeless = newMaterial.shadeless;
			api.setMaterial(myMaterials[k], function() {console.log("material updated")})
		}
	}
	console.log("END: configureMaterials")
}

var setVisibleNodes = function(api) {
	console.log("BEGIN: setVisibleNotes")
	var allCategorySelects = document.querySelectorAll(".sketchfab-geometry-category span.sketchfab-select-value")
	var selectedPrefixes = [];
	
	var lettersByDesignation = {};
	for (var i=0; i<allCategorySelects.length; ++i) {
		selectedPrefixes.push(allCategorySelects[i].textContent);
		lettersByDesignation[selectedPrefixes[i]] = []
	}
	
	var relevantNodes = [];
	
	for (var i=0; i<sceneGraph.length; ++i) {
		var indexContainingCodes = i;
		var isMatrixTransform = false;
		if (sceneGraph[i].name === "MatrixTransform") {
			indexContainingCodes = i - 1;
			isMatrixTransform = true;
		}
		
		var nodeNameArray = sceneGraph[indexContainingCodes].name.split("-")
		var currentNodeDesignation = nodeNameArray[0];
		var currentNodeLetterCode = nodeNameArray[1];
		api.hide(sceneGraph[indexContainingCodes].instanceID);
		if(selectedPrefixes.includes("SGBCC")) {
			if (sceneGraph[indexContainingCodes].name == "JBXCC-C-Housing") {
				api.show(sceneGraph[indexContainingCodes].instanceID)										
			}									
		}		
		
		if (selectedPrefixes.includes(currentNodeDesignation)) {
			for (var j=0; j<currentNodeLetterCode.length; ++j) {
				if (lettersByDesignation[currentNodeDesignation].indexOf(currentNodeLetterCode[j]) === -1) {
					lettersByDesignation[currentNodeDesignation].push(currentNodeLetterCode[j])
				}
				relevantNodes.push({letterCode: currentNodeLetterCode[j], instanceID: sceneGraph[i].instanceID, name: sceneGraph[i].name})								
			}
		}
	}		
	
	var letters = [];
	var commonLetter = ""
	for (var i=0; i<Object.values(lettersByDesignation).length; ++i) {
		if (Object.values(lettersByDesignation)[i].length === 1) {
			commonLetter = Object.values(lettersByDesignation)[i][0]
			break;
		}
		letters = letters.concat(Object.values(lettersByDesignation)[i])
		commonLetter = mode(letters)[0]
	}
	
	for (var i=0; i<relevantNodes.length; ++i) {
		if (relevantNodes[i].letterCode.indexOf(commonLetter) != -1) {
			api.show(relevantNodes[i].instanceID);
		}
	}
	console.log("END: sendVisibleNodes")
}

var mode = function(arr) { 
	if(arr.filter((x,index) => arr.indexOf(x) == index).length == arr.length) {
		return arr; 
	} else {
		return mode(arr.sort((x,index)=>x-index).map((x,index)=>arr.indexOf(x)!=index ? x : null ).filter(x=>x!=null))
	}		
}

var setNonPrimarySurfaceConfiguration = function(e, api) {
	console.log("BEGIN: setNonPrimarySurfaceConfiguration")
	handleUpdateSelect(e);
	var geometryName = e.target.id.split("-")[1]
	var attributeIndex = e.target.id.split("-")[2]
	configureMaterials(geometryName, api)
	
	console.log("END: setNonPrimarySurfaceConfiguration")
}

var handleUpdateSelect = function(e) {
	console.log("BEGIN: handleUpdateSelect")
	var nameCode = e.target.id.split("-")[0]
	
	if (!e.target.classList.contains('selected')) {
		
		e.target.parentNode.querySelector('.sketchfab-option.selected').classList.remove('selected');
		e.target.classList.add('selected');
		e.target.closest('.sketchfab-select').querySelector('.sketchfab-select__trigger span').textContent = nameCode;								
	}
	console.log("END: handleUpdateSelect")
}


var handleHidingOptions = function(optionName="") {
	var allCategoryOptions = document.querySelectorAll(".sketchfab-geometry-category .sketchfab-option")
	for (var k=0; k<allCategoryOptions.length; ++k) {
		allCategoryOptions[k].style.display = "block";
	}
	
	var currentCategorySelections = Array.from(document.querySelectorAll(".sketchfab-geometry-category .sketchfab-select"))
							.filter(select => !select.classList.contains("sketchfab-select-open"))
							.map(select => select.querySelector(".sketchfab-select-value").textContent)
							
	currentCategorySelections.push(optionName)
	
	for (var k=0; k<currentCategorySelections.length; ++k) {
		var selectionName = currentCategorySelections[k];
		if (hiddenCategoryConfigurations[selectionName] !== undefined) {
			for (var l=0; l<hiddenCategoryConfigurations[selectionName].length; ++l) {
				var nameToHide = hiddenCategoryConfigurations[selectionName][l]
				var optionToHide = document.querySelector("[data-value='" + nameToHide + "']")
				optionToHide.style.display = "none"										
			}
			break;
		}
	}
}

var disableAnimations = function() {		
	var allCategorySelects = document.querySelectorAll(".sketchfab-geometry-category span.sketchfab-select-value")
	var allowAnimations = true;
	for (var i=0; i<allCategorySelects.length; ++i) {
		var controlIndex = allCategorySelects[i].id.split("-")[1]
		var currentNameCode = allCategorySelects[i].textContent;
		for (var j=0; j<controls[controlIndex].configuration.geometries.length; ++j) {
			if (controls[controlIndex].configuration.geometries[j].designation === currentNameCode) {
				console.log("found matching geometry in control")
				if (controls[controlIndex].configuration.geometries[j].allowsAnimation === false) {
					allowAnimations = false;
				}
			}
		}
	}
	var animationButtons = document.querySelectorAll("#sketchfab-animation-buttons button")
	for (var i=0; i<animationButtons.length; ++i) {
		animationButtons[i].disabled = true;
	}
	if (allowAnimations) {
		for (var i=0; i<animationButtons.length; ++i) {
			animationButtons[i].disabled = false;
		}						
	}
}

var initializeGeometrySelect = function(controlIndex) {
					
	var wrapper = document.createElement("div")
	wrapper.classList.add("sketchfab-select-wrapper")
	wrapper.classList.add("sketchfab-geometry-category")
	wrapper.style.width = (appWidth/4) + "px";
	
	var select = document.createElement("div")
	select.classList.add("sketchfab-select")
	
	var selectTrigger = document.createElement("div")
	selectTrigger.classList.add("sketchfab-select__trigger")
	
	var triggerSpan = document.createElement("span")
	triggerSpan.textContent = controls[controlIndex].configuration.geometries[0].designation;
	triggerSpan.id = "triggerSpan-" + controlIndex;
	triggerSpan.classList.add("sketchfab-select-value")
	selectTrigger.appendChild(triggerSpan)
	
	var arrow = document.createElement("div")
	arrow.classList.add("sketchfab-select-arrow")
	selectTrigger.appendChild(arrow)					
	select.appendChild(selectTrigger)
	
	var customOptions = document.createElement("div")
	customOptions.classList.add("sketchfab-options")
	var selectTitle = document.createElement("h3")
	selectTitle.classList.add("sketchfab-title")
	selectTitle.textContent = controls[controlIndex].name;
	customOptions.appendChild(selectTitle)
	select.appendChild(customOptions)
	wrapper.appendChild(select)	

	wrapper.addEventListener('click', function() {
		this.querySelector('.sketchfab-select').classList.toggle('sketchfab-select-open');	
	})

	categorySelectObserver.observe(triggerSpan, {characterData: false, childList: true, attributes: false});
	
	return wrapper;
}

var initializeTextureSelect = function(geometryName, selectName, initialValue) {
	var wrapper = document.createElement("div")
	wrapper.classList.add("sketchfab-select-wrapper")
	
	wrapper.style.width = (appWidth/4) + "px";
	
	var select = document.createElement("div")
	select.classList.add("sketchfab-select")
	var selectTrigger = document.createElement("div")
	selectTrigger.classList.add("sketchfab-select__trigger")
	var triggerSpan = document.createElement("span")
	triggerSpan.textContent = initialValue;
	triggerSpan.classList.add(geometryName + "-triggerSpan")
	selectTrigger.appendChild(triggerSpan)
	var arrow = document.createElement("div")
	arrow.classList.add("sketchfab-select-arrow")
	selectTrigger.appendChild(arrow)
	
	var customOptions = document.createElement("div")
	customOptions.classList.add("sketchfab-options")
	var selectTitle = document.createElement("h3")
	selectTitle.classList.add("sketchfab-title")
	selectTitle.textContent = selectName;
	customOptions.appendChild(selectTitle)
	
	select.appendChild(selectTrigger)
	select.appendChild(customOptions)
	wrapper.appendChild(select)	

	wrapper.addEventListener('click', function() {
		this.querySelector('.sketchfab-select').classList.toggle('sketchfab-select-open');	
	})
	
	return wrapper;
}




`
)
}

export default ExportModal;
