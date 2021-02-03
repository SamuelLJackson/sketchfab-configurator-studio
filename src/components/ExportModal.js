import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
	toggleModalDisplay, 
	selectControls, 
	selectModelId,
	selectSceneGraph, 
	selectMaterials,
	selectSurfaceOptionMap,
} from './viewerSlice';

const ExportModal = () => {

    const dispatch = useDispatch();
	const controls = useSelector(selectControls);
	const modelId = useSelector(selectModelId);
	const sceneGraph = useSelector(selectSceneGraph);
	const materials = useSelector(selectMaterials);
	const surfaceOptionMap = useSelector(selectSurfaceOptionMap);

	const configurationMaps = {
		controls, 
		modelId, 
		sceneGraph, 
		materials,
		surfaceOptionMap, 
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
	} = configurationMaps;

	return (
`
// Sketchfab Viewer API: Change Texture/material
var version = '1.8.2';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);

var uid = '${modelId === '' ? '9d5bb1c929b142978ee8a780d170e1a5' : modelId}';

/*
	COPY THE LINE BELOW
*/

var controls = ${JSON.stringify(controls)}

/*
	COPY THE LINE ABOVE
*/

var myMaterials = ${JSON.stringify(materials)}

var sceneGraph = ${JSON.stringify(sceneGraph)}

var isElementCategoryControlled = false;
var surfaceConfigurationMode = false;
var surfaceOptionMap = ${JSON.stringify(surfaceOptionMap)};

var animationObjects = {};

var controlsContainer = document.getElementById('sketchfab-lower-controls');
var toggleableItems = {};

var currentAnimation = "";
var currentAnimationEndTime = 0;

var appContainer = document.querySelector("div.sketchfab__container")
appContainer.style.display = "block"

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
					
					var wrapper = initializeSelect(i);
					wrapper.classList.add("sketchfab-geometry-category")
					
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
					for (var j=0; j<controls[i].configuration.geometries.length; ++j) {
						
						let customOption = document.createElement("span")
						customOption.classList.add("sketchfab-option");
						var name = controls[i].configuration.geometries[j].designation;
						var humanReadable = controls[i].configuration.geometries[j].humanReadable;
						customOption.setAttribute("data-value", name)
						customOption.id = name + "-" + j + "-" + i;
						customOption.innerHTML = name + " - " + humanReadable;
						if (controls[i].configuration.geometries[j].designation === controls[i].initialValue) {
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
				} else if (controls[i].type === "textureCategory") {
					surfaceConfigurationMode = true					
					const { geometryName, options, isPrimary, ordering} = controls[i].configuration
					
					var controlIndex = i;
					var wrapper = initializeSelect(controlIndex, geometryName)
					wrapper.classList.add("sketchfab-texture-category")
					wrapper.id = geometryName + "-" + ordering;
					
					var customOptions = wrapper.querySelector(".sketchfab-options")
					
						for (var j=0; j<options.length; ++j) {
							let customOption = document.createElement("span")
							customOption.classList.add("sketchfab-option");
							const { name, humanReadable } = options[j];
							if (name === controls[i].initialValue) {
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

client.init(uid, {
	success: success,
	error: () => console.error('Sketchfab API error'),
	autostart: 0,
	preload: 0,
	ui_animations: 0,
	ui_watermark: 0,
	ui_inspector: 0,
	ui_stop: 0,
	ui_infos: 0,
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
			var availableOptions = surfaceOptionMap[geometryName][currentInitialPrimarySelection][ordering-1].sort()
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
		console.log("materialNameString:")
		console.log(materialNameString)
		var newMaterial;
		for (var j=0; j<myMaterials.length; ++j) {
			if (myMaterials[j].name.startsWith(materialNameString)) {
				newMaterial = JSON.parse(JSON.stringify(myMaterials[j]));
			}
		}
		console.log("newMaterial:")
		console.log(newMaterial)
		
		for (var j=0; j<myMaterials.length; ++j) {
			if (myMaterials[j].name === geometryName) {
				myMaterials[j].channels = JSON.parse(JSON.stringify(newMaterial.channels));
				myMaterials[j].reflection = newMaterial.reflection;
				myMaterials[j].reflector = newMaterial.reflector;
				myMaterials[j].shadeless = newMaterial.shadeless;
				api.setMaterial(myMaterials[j], function() {console.log("material updated")})
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
	
	for (var i=0; i<sceneGraph.length; ++i) {
		var indexContainingCodes = i;
		var isMatrixTransform = false;
		if (sceneGraph[i].name === "MatrixTransform") {
			isMatrixTransform = true;
			if (sceneGraph[i].depth < 3) {
				indexContainingCodes = i + 1;
			} else {
				indexContainingCodes = i - 1;
			}
		}
		
		var nodeNameArray = sceneGraph[indexContainingCodes].name.split("-")
		var currentNodeDesignation = nodeNameArray[0];
		var currentNodeLetterCode = nodeNameArray[1];
		api.hide(sceneGraph[indexContainingCodes].instanceID);
		
		if (selectedPrefixes.includes(currentNodeDesignation)) {
			for (var j=0; j<currentNodeLetterCode.length; ++j) {
				if (lettersByDesignation[currentNodeDesignation].indexOf(currentNodeLetterCode[j]) === -1) {
					lettersByDesignation[currentNodeDesignation].push(currentNodeLetterCode[j])
				}	
			}					
			
			var currentUpstreamDepth = Number(sceneGraph[i].depth)
			var currentUpstreamIndex = i-1;
			var upStreamRelevantNodes = []
			while(currentUpstreamDepth > 2) {
				if (sceneGraph[currentUpstreamIndex].depth < currentUpstreamDepth) {
					var currentUpstreamDesignation = sceneGraph[currentUpstreamIndex].name.split("-")[0]
					var currentUpstreamLetterCode = sceneGraph[currentUpstreamIndex].name.split("-")[1]
					if (currentUpstreamDesignation !== currentNodeDesignation) {
						upStreamRelevantNodes.push({letterCode: currentUpstreamLetterCode, instanceID: sceneGraph[currentUpstreamIndex].instanceID, name: sceneGraph[currentUpstreamIndex].name})
					}	
					currentUpstreamDepth = Number(sceneGraph[currentUpstreamIndex].depth);
				}
				currentUpstreamIndex = currentUpstreamIndex - 1;
			}
			
			relevantNodes.push({letterCode: currentNodeLetterCode, instanceID: sceneGraph[i].instanceID, name: sceneGraph[i].name, upStreamRelevantNodes: upStreamRelevantNodes})		
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
			for (var j=0; j<relevantNodes[i].upStreamRelevantNodes.length; ++j) {
				console.log("showing upstream node:")
				console.log(relevantNodes[i].upStreamRelevantNodes[j].name)
				api.show(relevantNodes[i].upStreamRelevantNodes[j].instanceID)
			}
		}
	}
	console.log("END: setVisibleNodes")
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
				
	var allCategoryOptions = document.querySelectorAll(".sketchfab-geometry-category .sketchfab-option")
	var currentCategorySelections = Array.from(document.querySelectorAll(".sketchfab-geometry-category .sketchfab-select"))
							.map(select => select.querySelector(".sketchfab-select-value").textContent)
							
	var geometryControls = controls.filter(control => control.type === "geometryCategory")

	var disabledOptions = []
	for(var i=0; i<geometryControls.length; ++i) {
		var hiddenValues = geometryControls[i].configuration.geometries.filter(geometry => geometry.designation === currentCategorySelections[i])[0].hiddenValues;
		disabledOptions = disabledOptions.concat(hiddenValues)
	}
	
	for (var i=0; i<allCategoryOptions.length; ++i) {
		allCategoryOptions[i].style.display = "block";
		if (disabledOptions.includes(allCategoryOptions[i].getAttribute("data-value"))) {
			allCategoryOptions[i].style.display = "none"
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
	triggerSpan.textContent = controls[controlIndex].initialValue;
	
	var arrow = document.createElement("div")
	arrow.classList.add("sketchfab-select-arrow")
	
	var customOptions = document.createElement("div")
	customOptions.classList.add("sketchfab-options")
	var selectTitle = document.createElement("h3")
	selectTitle.classList.add("sketchfab-title")
	selectTitle.textContent = controls[controlIndex].name;
	
	selectTrigger.appendChild(triggerSpan)
	selectTrigger.appendChild(arrow)
	customOptions.appendChild(selectTitle)
	select.appendChild(selectTrigger)
	select.appendChild(customOptions)
	wrapper.appendChild(select)	

	wrapper.addEventListener('click', function() {
		this.querySelector('.sketchfab-select').classList.toggle('sketchfab-select-open');	
	})
	
	return wrapper;
	console.log("END: initializeSelect:")
}

















`
)
}

export default ExportModal;
