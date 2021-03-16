import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
	toggleModalDisplay, 
	selectModelList
} from './viewerSlice';

const ExportModal = () => {
	const modelList = useSelector(selectModelList)

    const dispatch = useDispatch();

    return (
        <div id="modal">
            <div className="modal__content">
                <span class="close"
                    onClick={() => dispatch(toggleModalDisplay())}>&times;</span>
                <div className="modal__header">
                    <h1>Add This To Your Page</h1>
                </div>
                <textarea id="js-output" value={createJSExport(modelList)} />
            </div>
        </div>
    )
}

const createJSExport = (modelList) => {

	return (
`
// Sketchfab Viewer API: Change Texture/material
var version = '1.9.0';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

/*
	COPY THE LINE BELOW
*/

var modelList = ${JSON.stringify(modelList)}

/*
	COPY THE LINE ABOVE
*/

var currentModelIndex = 0;

for (var i=0; i<modelList.length; ++i) {
	if (modelList[i].isInitial == true) {
		currentModelIndex = i;
		break;
	}
}

var isElementCategoryControlled = false;
var surfaceConfigurationMode = false;

var animationObjects = {};
var toggleableItems = {};

var currentAnimationIndex = 0;
var currentAnimationEndTime = 0;

var globalDisabledControls = [];

var animationsEnabled = false;

var apiSkfb, pollTime;

var controlsContainer = document.getElementById('sketchfab-lower-controls');

var appContainer = document.querySelector("div.sketchfab__container")
appContainer.style.display = "block"

var animationButtonContainer = document.getElementById("sketchfab-animation-buttons")

pollTime = function() {
	apiSkfb.getCurrentTime(function(err, time) {	
		if (animationsEnabled) {
			if (currentAnimationEndTime > 0 && time >= currentAnimationEndTime) {
				apiSkfb.pause();
			}
			requestAnimationFrame(pollTime);
		}
	});
};

var viewerAPIs = {};

var success = function(api) {
    apiSkfb = api;
	api.start(function() {
		api.addEventListener('viewerready', function() {
			
			api.pause();
			
			var animations = [];
			for (let i = 0; i < modelList[currentModelIndex].controls.length; ++i) {	
				globalDisabledControls.push(false);
				if (modelList[currentModelIndex].controls[i].type == "animation") {
					var animationControls = document.getElementById("sketchfab-animation-controls")
					animationControls.style.display = "block";
					
					var animationButton = document.createElement("button")
					animationButton.id = "animation-" + modelList[currentModelIndex].controls[i].id + "-" + i
					animationButton.textContent = modelList[currentModelIndex].controls[i].name;
					animationButton.addEventListener('click', function(e) {
						var animationId = e.target.id.split("-")[1]
						currentAnimationIndex = e.target.id.split("-")[2]
						var startTime = animationObjects[animationId].startTime;
						var endTime = animationObjects[animationId].endTime;
						var animationUID = animationObjects[animationId].uid;
						currentAnimationEndTime = endTime;

						apiSkfb.setCurrentAnimationByUID(animationUID)
						apiSkfb.seekTo(startTime);
						
						var animationButtons = document.querySelector("#sketchfab-animation-buttons").querySelectorAll("button")
						for (var j=0; j<animationButtons.length; ++j) {
							animationButtons[j].disabled = false;
							animationButtons[j].style.border = "none"
							animationButtons[j].style.opacity = 1
							if (animationButtons[j].textContent === e.target.textContent) {
								animationButtons[j].disabled = true;
								animationButtons[j].style.border = "1px solid black"
								animationButtons[j].style.opacity = 0.5							
							}
						}
						setTimeout(function() { apiSkfb.play();	}, 100);
					})
					animationButtonContainer.appendChild(animationButton)
					
					var isInitialAnimationPosition = modelList[currentModelIndex].controls[i].configuration.isDisabledInitially
					if (isInitialAnimationPosition) {
						animationButton.disabled = true;
						animationButton.style.border = "1px solid black"
						animationButton.style.opacity = 0.5
						currentAnimationIndex = i
					}
					
					animations.push(modelList[currentModelIndex].controls[i]);
					animationObjects[modelList[currentModelIndex].controls[i].id] = {name: modelList[currentModelIndex].controls[i].name, startTime: Number(modelList[currentModelIndex].controls[i].configuration.startTime), endTime: Number(modelList[currentModelIndex].controls[i].configuration.endTime), uid: modelList[currentModelIndex].controls[i].configuration.animationUID}; 
					continue;
				}
				var singleControlContainer = document.createElement("div");
				singleControlContainer.classList.add("sketchfab-single-control-container");		
											
				
				if (modelList[currentModelIndex].controls[i].type == "color") {
					var resetBut = document.createElement("button");
					resetBut.innerHTML = "Reset";
					resetBut.onclick = function(e) {	
						var m = modelList[currentModelIndex].materials[modelList[currentModelIndex].controls[i].entityIndex];
						m = JSON.parse(JSON.stringify(modelList[currentModelIndex].controls[i].entity));
							
						api.setMaterial(m);
					}
					singleControlContainer.appendChild(resetBut);
					
					for (let j = 0; j < modelList[currentModelIndex].controls[i].additionalColors.length; ++j) {
						var colorBut = document.createElement("button");

						colorBut.innerHTML = modelList[currentModelIndex].controls[i].additionalColors[j].name;
						
						colorBut.id = modelList[currentModelIndex].controls[i].id + "-" + modelList[currentModelIndex].controls[i].name
						colorBut.onclick = function(e) {	
							var m = modelList[currentModelIndex].materials[modelList[currentModelIndex].controls[i].entityIndex];
							m.channels.AlbedoPBR.factor = 1;
							m.channels.AlbedoPBR.enable = true;
							m.channels.AlbedoPBR.color = modelList[currentModelIndex].controls[i].additionalColors[j].colorRGB;
							m.channels.AlbedoPBR.texture = null;
							
							m.channels.DiffuseColor.factor = 1;
							m.channels.DiffuseColor.enable = true;
							m.channels.DiffuseColor.color = modelList[currentModelIndex].controls[i].additionalColors[j].colorRGB;
							m.channels.DiffuseColor.texture = null;
							
							m.channels.DiffusePBR.color = modelList[currentModelIndex].controls[i].additionalColors[j].colorRGB;
							m.channels.DiffusePBR.enable = false;
							m.channels.DiffusePBR.factor = 1;
							
							api.setMaterial(m);
						}
						singleControlContainer.appendChild(colorBut);
					}	
				} else if (modelList[currentModelIndex].controls[i].type === "geometryCategory") {	
					isElementCategoryControlled = true;
					
					var wrapper = initializeSelect(i);
					wrapper.classList.add("sketchfab-geometry-category")
					
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
					for (var j=0; j<modelList[currentModelIndex].controls[i].configuration.geometries.length; ++j) {
						
						let customOption = document.createElement("span")
						customOption.classList.add("sketchfab-option");
						var name = modelList[currentModelIndex].controls[i].configuration.geometries[j].designation;
						var humanReadable = modelList[currentModelIndex].controls[i].configuration.geometries[j].humanReadable;
						customOption.setAttribute("data-value", name)
						customOption.id = name + "-" + j + "-" + i;
						customOption.innerHTML = name + " - " + humanReadable;
						if (modelList[currentModelIndex].controls[i].configuration.geometries[j].designation === modelList[currentModelIndex].controls[i].initialValue) {
							customOption.classList.add("selected")
						}
						customOption.addEventListener('click', function(e) {
							handleUpdateSelect(e);
							disableAnimations();
							handleHidingGeometryCombinations();
							setVisibleNodes(api);
						})
						
						customOptions.appendChild(customOption)
					}
					
					singleControlContainer.appendChild(wrapper);		
				} else if (modelList[currentModelIndex].controls[i].type === "textureCategory") {
					surfaceConfigurationMode = true					
					const { geometryName, options, isPrimary, ordering} = modelList[currentModelIndex].controls[i].configuration
					
					var controlIndex = i;
					var wrapper = initializeSelect(controlIndex, geometryName)
					wrapper.classList.add("sketchfab-texture-category")
					wrapper.id = geometryName + "-" + ordering;
					
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
						for (var j=0; j<options.length; ++j) {
							let customOption = document.createElement("span")
							customOption.classList.add("sketchfab-option");
							const { name, humanReadable } = options[j];
							if (name === modelList[currentModelIndex].controls[i].initialValue) {
								customOption.classList.add("selected");
							}
							
							customOption.setAttribute("data-value", name)
							customOption.id = name + "-" + geometryName + "-" + j + "-" + j + "-" + i;
							customOption.innerHTML = name + " - " + humanReadable;
							customOption.addEventListener('click', e => {
								handleUpdateSelect(e);			
								handleHidingTextureCombinations()
								configureMaterials(api) 
							})
								
							
							customOptions.appendChild(customOption)
						}
						singleControlContainer.appendChild(wrapper);
						
				} else if (modelList[currentModelIndex].controls[i].type == "toggle") {
					toggleableItems[String(modelList[currentModelIndex].controls[i].entity.instanceID)] = "visible";
					var toggleBut = document.createElement("button");
					toggleBut.innerHTML = "Toggle " + modelList[currentModelIndex].controls[i].name;
					toggleBut.id = modelList[currentModelIndex].controls[i].entity.instanceID;
					toggleBut.onclick = function(e) {
						var isVisible = toggleableItems[e.target.id];
						if (isVisible == "visible") {
							api.hide(e.target.id);
							toggleableItems[String(modelList[currentModelIndex].controls[i].entity.instanceID)] = "hidden";
						} else {
							api.show(e.target.id);
							toggleableItems[String(modelList[currentModelIndex].controls[i].entity.instanceID)] = "visible";
						}
					}
					singleControlContainer.appendChild(toggleBut);
				}
				controlsContainer.appendChild(singleControlContainer);
			}
			

			if (isElementCategoryControlled) {
				setVisibleNodes(api);
				disableAnimations();
				handleHidingGeometryCombinations();
			}
			
			if (animations.length > 0) {
				pollTime();			
			}			
			
			if (surfaceConfigurationMode) {
				handleHidingTextureCombinations()
				configureMaterials(api)
			}
			window.addEventListener('click', function(e) {
				for (const select of document.querySelectorAll('.sketchfab-select')) {
					if (!select.contains(e.target)) {
						select.classList.remove('sketchfab-select-open');
					}
				}
			});
		});
	});
};

client.init(modelList[currentModelIndex].uid, {
	success: success,
	error: () => console.error('Sketchfab API error'),
	merge_materials: 1,
	material_packing: 1,
	//graph_optimizer: 1,
	autostart: 1,
	preload: 0,
	ui_animations: 0,
	ui_watermark: 0,
	ui_inspector: 0,
	ui_stop: 0,
	ui_infos: 0,
	ui_fullscreen: window.innerWidth < 1000 ? 0 : 1,
});

var handleHidingTextureCombinations = function(api) {
	console.log("BEGIN: handleHidingTextureCombinations")
	
	var textureSelects = document.getElementsByClassName("sketchfab-texture-category")	
	for (var i=0; i<textureSelects.length; ++i) {
		var options = textureSelects[i].getElementsByClassName("sketchfab-option");
		var geometryName = textureSelects[i].id.split("-")[0]
		var ordering = textureSelects[i].id.split("-")[1]
		var isPrimary = Number(ordering) === 0;
		if (!isPrimary) {
			var currentInitialPrimarySelection = document.getElementById(geometryName + "-0").querySelector(".sketchfab-select__trigger span").textContent;
			var availableOptions = modelList[currentModelIndex].surfaceOptionMap[geometryName][currentInitialPrimarySelection][ordering-1].sort()
			var previouslyAvailableOptions =  Array.from(options).filter(op => op.style.display === "block").map(op => op.getAttribute("data-value")).sort()
			let equal = availableOptions.length == previouslyAvailableOptions.length && availableOptions.every((element, index)=> element === previouslyAvailableOptions[index] );
			
			var triggerSpan = textureSelects[i].querySelector(".sketchfab-select__trigger span")
			
			if (!equal) {
				var newValueSet = false;
				for (var j=0; j<options.length; ++j) {
					options[j].classList.remove("selected")
					var optionValue = options[j].getAttribute("data-value")
					options[j].style.display = "none"
					var optionValue = options[j].getAttribute("data-value")
					if (availableOptions.includes(optionValue)) {
						options[j].style.display = "block"
						if (!newValueSet) {
							triggerSpan.textContent = optionValue;
							options[j].classList.add("selected")
							newValueSet = true;							
						}
					}
				}
			}
		}
	}

	console.log("END: handleHidingTextureCombinations")
}

var configureMaterials = function(api) {
	console.log("BEGIN: configureMaterials")
	var textureSelects = document.getElementsByClassName("sketchfab-texture-category")	
	for (var i=0; i<textureSelects.length; ++i) {
		var geometryName = textureSelects[i].id.split("-")[0]
		//get array of selected values
		var relevantSelects = document.getElementsByClassName(geometryName + "-triggerSpan")
		//build name string via accessing selected values
		var materialNameString = geometryName + "-";
		
		for (var j=0; j<relevantSelects.length; ++j) {
			materialNameString += relevantSelects[j].textContent + "-";
		}
		var newMaterial;
		for (var j=0; j<modelList[currentModelIndex].materials.length; ++j) {
			if (modelList[currentModelIndex].materials[j].name.startsWith(materialNameString)) {
				newMaterial = JSON.parse(JSON.stringify(modelList[currentModelIndex].materials[j]));
			}
		}
		
		for (var j=0; j<modelList[currentModelIndex].materials.length; ++j) {
			if (modelList[currentModelIndex].materials[j].name === geometryName) {
				modelList[currentModelIndex].materials[j].channels = JSON.parse(JSON.stringify(newMaterial.channels));
				modelList[currentModelIndex].materials[j].reflection = newMaterial.reflection;
				modelList[currentModelIndex].materials[j].reflector = newMaterial.reflector;
				modelList[currentModelIndex].materials[j].shadeless = newMaterial.shadeless;
				api.setMaterial(modelList[currentModelIndex].materials[j], function() {console.log("material updated")})
			}
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
	
	for (var i=0; i<modelList[currentModelIndex].sceneGraph.length; ++i) {
		var indexContainingCodes = i;
		if (modelList[currentModelIndex].sceneGraph[i].name === "MatrixTransform") {
			if (modelList[currentModelIndex].sceneGraph[i].depth < 3) {
				indexContainingCodes = i + 1;
			} else {
				indexContainingCodes = i - 1;
			}
		}
		
		var nodeNameArray = modelList[currentModelIndex].sceneGraph[indexContainingCodes].name.split("-")
		var currentNodeDesignation = nodeNameArray[0];
		var currentNodeLetterCode = nodeNameArray[1];
		api.hide(modelList[currentModelIndex].sceneGraph[indexContainingCodes].instanceID);
		
		if (selectedPrefixes.includes(currentNodeDesignation)) {
			for (var j=0; j<currentNodeLetterCode.length; ++j) {
				if (lettersByDesignation[currentNodeDesignation].indexOf(currentNodeLetterCode[j]) === -1) {
					lettersByDesignation[currentNodeDesignation].push(currentNodeLetterCode[j])
				}	
			}		
			
			relevantNodes.push({
				letterCode: currentNodeLetterCode, 
				instanceID: modelList[currentModelIndex].sceneGraph[i].instanceID, 
				name: modelList[currentModelIndex].sceneGraph[i].name, 
				upstreamRelevantNodes: collectUpstreamNodes(i),
				boneNodes: collectBoneNodes(i),
			})		
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
			for (var j=0; j<relevantNodes[i].upstreamRelevantNodes.length; ++j) {
				api.show(relevantNodes[i].upstreamRelevantNodes[j].instanceID)
			}
			for (var j=0; j<relevantNodes[i].boneNodes.length; ++j) {
				api.show(relevantNodes[i].boneNodes[j].instanceID);
			}
		}
	}
	console.log("END: setVisibleNodes")
}

var collectUpstreamNodes = function(nodeIndex) {
	var nodeNameArray = modelList[currentModelIndex].sceneGraph[nodeIndex].name.split("-")
	var initialNodeDesignation = nodeNameArray[0];
			
	var currentUpstreamDepth = Number(modelList[currentModelIndex].sceneGraph[nodeIndex].depth)
	var currentUpstreamIndex = nodeIndex - 1;
	var upstreamRelevantNodes = []
	while(currentUpstreamDepth > 1) {
		if (modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].depth < currentUpstreamDepth) {
			var currentUpstreamDesignation = modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].name.split("-")[0]
			var currentUpstreamLetterCode = modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].name.split("-")[1]
			if (currentUpstreamDesignation !== initialNodeDesignation) {
				upstreamRelevantNodes.push({
					letterCode: currentUpstreamLetterCode, 
					instanceID: modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].instanceID, 
					name: modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].name
				})
			}	
			currentUpstreamDepth = Number(modelList[currentModelIndex].sceneGraph[currentUpstreamIndex].depth);
		}
		currentUpstreamIndex = currentUpstreamIndex - 1;
	}

	return upstreamRelevantNodes;
}

var collectBoneNodes = function(nodeIndex) {
	
	var downStreamRelevantNodes = []
	if (modelList[currentModelIndex].sceneGraph[nodeIndex].type === "Group") {
		var currentDownstreamIndex = nodeIndex + 1;
		var initialDepth = Number(modelList[currentModelIndex].sceneGraph[nodeIndex].depth)
		var currentDownstreamDepth = Number(modelList[currentModelIndex].sceneGraph[currentDownstreamIndex].depth)
		while(currentDownstreamDepth>initialDepth && modelList[currentModelIndex].sceneGraph[currentDownstreamIndex] !== undefined) {
			var currentDownStreamNode = {
				letterCode: "NA", 
				instanceID: modelList[currentModelIndex].sceneGraph[currentDownstreamIndex].instanceID, 
				name: "NA", 
				upstreamRelevantNodes: [],
			}
			downStreamRelevantNodes.push(currentDownStreamNode)	
			currentDownstreamDepth = modelList[currentModelIndex].sceneGraph[currentDownstreamIndex].depth;
			currentDownstreamIndex += 1;
		}
	}
	
	return downStreamRelevantNodes;
}
var mode = function(arr) { 
	if(arr.filter((x,index) => arr.indexOf(x) == index).length == arr.length) {
		return arr; 
	} else {
		return mode(arr.sort((x,index)=>x-index).map((x,index)=>arr.indexOf(x)!=index ? x : null ).filter(x=>x!=null))
	}		
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

var handleHidingGeometryCombinations = function() {
	console.log("BEGIN: handleHidingGeometryCombinations")
				
	var allCategoryOptions = document.querySelectorAll(".sketchfab-geometry-category .sketchfab-option")
	var currentCategorySelections = Array.from(document.querySelectorAll(".sketchfab-geometry-category .sketchfab-select"))
							.map(select => select.querySelector(".sketchfab-select-value").textContent)
							
	var allGeoSelects = document.getElementsByClassName("sketchfab-geometry-category")
							
	var geometryControls = modelList[currentModelIndex].controls.filter(control => control.type === "geometryCategory")

	var disabledOptions = []
	var disabledControls = []
	for(var i=0; i<geometryControls.length; ++i) {
		var hiddenValues = geometryControls[i].configuration.geometries.filter(geometry => geometry.designation === currentCategorySelections[i])[0].hiddenValues;
		var disabledValues = geometryControls[i].configuration.geometries.filter(geometry => geometry.designation === currentCategorySelections[i])[0].disabledTextureControls;
		console.log("geometryControls[" + i + "]:")
		console.log(geometryControls[i])
		disabledOptions = disabledOptions.concat(hiddenValues)
		disabledControls = disabledControls.concat(disabledValues)
	}
	
	for (var i=0; i<allCategoryOptions.length; ++i) {
		allCategoryOptions[i].style.display = "block";
		if (disabledOptions.includes(allCategoryOptions[i].getAttribute("data-value"))) {
			allCategoryOptions[i].style.display = "none"
		}
	}
	
	for (var i=0; i<currentCategorySelections.length; ++i) {
		if (disabledOptions.includes(currentCategorySelections[i])) {
			for(var j=0; j<allGeoSelects[i].querySelectorAll(".sketchfab-option").length; ++j) {
				if (allGeoSelects[i].querySelectorAll(".sketchfab-option")[j].style.display === "block") {
					allGeoSelects[i].querySelector(".sketchfab-select-value").textContent = allGeoSelects[i].querySelectorAll(".sketchfab-option")[j].getAttribute("data-value")
					break;
				}
			}
		}
	}
	
	var dropdownControls = document.querySelectorAll(".sketchfab-single-control-container")
	var nonCategoryControlOffset = 0;
	for (var i=0; i<modelList[currentModelIndex].controls.length; ++i) {
		globalDisabledControls[i] = false;
		if (modelList[currentModelIndex].controls[i].type.includes("Category")) {
			document.querySelectorAll(".sketchfab-single-control-container")[i-nonCategoryControlOffset].style.opacity = 1;
			if (disabledControls.includes(modelList[currentModelIndex].controls[i].name)) {
				globalDisabledControls[i] = true;
				document.querySelectorAll(".sketchfab-single-control-container")[i-nonCategoryControlOffset].style.opacity = 0.3;			
			}
		} else {
			nonCategoryControlOffset += 1;
		}
	}
	console.log("END: handleHidingGeometryCombinations")
}

var disableAnimations = function() {		
	var allCategorySelects = document.querySelectorAll(".sketchfab-geometry-category span.sketchfab-select-value")
	var allowAnimations = true;
	for (var i=0; i<allCategorySelects.length; ++i) {
		var controlIndex = allCategorySelects[i].id.split("-")[1]
		var currentNameCode = allCategorySelects[i].textContent;
		for (var j=0; j<modelList[currentModelIndex].controls[controlIndex].configuration.geometries.length; ++j) {
			if (modelList[currentModelIndex].controls[controlIndex].configuration.geometries[j].designation === currentNameCode) {
				if (modelList[currentModelIndex].controls[controlIndex].configuration.geometries[j].allowsAnimation === false) {
					allowAnimations = false;
				}
			}
		}
	}
	var animationButtons = document.querySelectorAll("#sketchfab-animation-buttons button")
	
	for (var i=0; i<animationButtons.length; ++i) {
		animationButtons[i].disabled = true;
	}
	
	var initiallyDisabled = animationsEnabled === false
	
	animationsEnabled = false;
	if (allowAnimations) {
		for (var i=0; i<animationButtons.length; ++i) {
			if (animationButtons[i].textContent !== modelList[currentModelIndex].controls[currentAnimationIndex].name) {
				animationButtons[i].disabled = false;
			}
		}	
		animationsEnabled = true;
		if (initiallyDisabled) {
			var animationUID = Object.values(animationObjects)[0].uid
			apiSkfb.setCurrentAnimationByUID(animationUID);
			pollTime();
		}
	}
}

var initializeSelect = function(controlIndex, geometryName="") {
	console.log("BEGIN: initializeSelect:")

	var wrapper = document.createElement("div")
	wrapper.classList.add("sketchfab-select-wrapper")	
	var appWidth = Number(appContainer.clientWidth)
	wrapper.style.width = (appWidth/4) + "px";
	
	var select = document.createElement("div")
	select.classList.add("sketchfab-select")
	
	var selectTrigger = document.createElement("div")
	selectTrigger.classList.add("sketchfab-select__trigger")
	
	var triggerSpan = document.createElement("span")
	triggerSpan.id = "triggerSpan-" + controlIndex;
	triggerSpan.classList.add("sketchfab-select-value")
	triggerSpan.classList.add(geometryName + "-triggerSpan")
	triggerSpan.textContent = modelList[currentModelIndex].controls[controlIndex].initialValue;
	
	var arrow = document.createElement("div")
	arrow.classList.add("sketchfab-select-arrow")
	
	var customOptions = document.createElement("div")
	customOptions.classList.add("sketchfab-options")
	var selectTitle = document.createElement("h3")
	selectTitle.classList.add("sketchfab-title")
	selectTitle.textContent = modelList[currentModelIndex].controls[controlIndex].name;
	
	selectTrigger.appendChild(triggerSpan)
	selectTrigger.appendChild(arrow)
	customOptions.appendChild(selectTitle)
	select.appendChild(selectTrigger)
	select.appendChild(customOptions)
	wrapper.appendChild(select)	

	wrapper.addEventListener('click', function() {
		console.log("BEGIN: wrapper click");
		var index = this.querySelector(".sketchfab-select-value").id.split("-")[1]
		if (globalDisabledControls[index] === false) {
			this.querySelector('.sketchfab-select').classList.toggle('sketchfab-select-open');	
		}
		console.log("END: wrapper click");
	})
	
	return wrapper;
	console.log("END: initializeSelect:")
}

var changeViewerContainer = document.querySelector("#change-viewer-container");

if (modelList.length > 1) {
	for (var i = 0; i<modelList.length; ++i) {
		console.log("modelList:")
		console.log(modelList)
		var viewerButton = document.createElement("button");
		viewerButton.id = "index" + "-" + i;
		viewerButton.classList.add("view-change__button")
		viewerButton.textContent = modelList[i].name;
		viewerButton.style.border = "1px solid gray"
		if (currentModelIndex === i) {		
			viewerButton.style.backgroundColor = "white"
			viewerButton.style.color = "gray"
			viewerButton.style.fontWeight = "bold !important"
			viewerButton.style.cursor = "auto"
		}
		viewerButton.addEventListener("click", function() {
			var viewChangeButtons = document.querySelectorAll(".view-change__button")
			for (var j=0; j<viewChangeButtons.length; ++j) {
				viewChangeButtons[j].style.backgroundColor = "gray";
				viewChangeButtons[j].style.color = "white"
				viewChangeButtons[j].style.fontWeight = "500 !important"
				viewChangeButtons[j].style.cursor = "pointer"
			}
			
			this.style.backgroundColor = "white"
			this.style.color = "gray"
			this.style.fontWeight = "bold !important"
			this.style.cursor = "auto"

			controlsContainer.innerHTML = null;

			animationButtonContainer.innerHTML = null;
			var index = this.id.split("-")[1]
			apiSkfb.stop();
			currentModelIndex = index;

			isElementCategoryControlled = false;
			surfaceConfigurationMode = false;

			animationObjects = {};
			toggleableItems = {};
			currentAnimationIndex = 0;
			currentAnimationEndTime = 0;

			globalDisabledControls = [];

			animationsEnabled = false;

			client.init(modelList[index].uid, {
				success: success,
				error: () => console.error('Sketchfab API error'),
				merge_materials: 1,
				material_packing: 1,
				autostart: 1,
				preload: 0,
				ui_animations: 0,
				ui_watermark: 0,
				ui_inspector: 0,
				ui_stop: 0,
				ui_infos: 0,
			});
		});
		changeViewerContainer.appendChild(viewerButton);
	}
}



`
)
}

export default ExportModal;
