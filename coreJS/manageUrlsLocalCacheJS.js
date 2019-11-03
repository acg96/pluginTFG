//Used to translate the string api response to the format needed
//apiMode -> string with the mode (whitelist or blacklist)
function translateApiMode(apiMode){
	var listMode= {whitelist: false};
	if (apiMode === "whitelist"){
		listMode.whitelist= true;
	}
	return listMode;
}

//Used to manage the restriction slots (EXTERNAL)
//slots -> an array with the slots to be settled
//callback -> a callback function used to warn when the process ends
function manageSlots(slots, callback){
	var isCacheSettledNow= false; //Used to know if a cache was settled and therefore the callback called
	if (slots != null){
		getStartTime(startTime => {
			startTime= startTime != null ? startTime : 0;
			for (var i= 0; i < slots.length; ++i){
				if (slots[i].startTime <= startTime && slots[i].endTime > startTime){ //It should be settled now
					isCacheSettledNow= true;
					storeUrl(slots[i].urls, translateApiMode(slots[i].listMode), slots[i].slotId, () => {
						callback();
					});
					var endtimeoutFunction= setTimeout(() => {
						storeUrl([], {whitelist: false}, "-1", ()=>{
						});
						showTrayNotification(1, "Información", "La restricción ha terminado.");
					}, slots[i].endTime - startTime);
					programmedTimeoutFunctions.push(endtimeoutFunction);
				} else if (slots[i].startTime > startTime && slots[i].endTime > startTime){ //It should be programmed
					var timeoutFunction= setTimeout((slot, startTime) => {
						showTrayNotification(1, "Información", "Se ha iniciado la restricción " + slot.groupName + ". Para cualquier duda póngase en contacto con el profesor.");
						storeUrl(slot.urls, translateApiMode(slot.listMode), slot.slotId, () => {
							notifyAction("1133", "");
							var timeoutFunctionEnds= setTimeout(()=>{ //To remove the restriction when arrives the slot end time
								storeUrl([], {whitelist: false}, "-1", ()=>{
								});
								showTrayNotification(1, "Información", "La restricción ha terminado.");
							}, slot.endTime - slot.startTime);
							programmedTimeoutFunctions.push(timeoutFunctionEnds);
						});					
					}, slots[i].startTime - startTime, slots[i], startTime);
					programmedTimeoutFunctions.push(timeoutFunction);
				}
			}
			if (!isCacheSettledNow){ //If any slot applies the current time
				storeUrl([], {whitelist: false}, "-1", () => {
					callback();
				});
			}
		});
	} else {
		throw "The value received as slots is null";
	}
}

//Used to set the current slot id (EXTERNAL)
//slotId -> a string with the value
//callback -> a callback function called when the process ends
function setSlotId(slotId, callback){
	var keyStorage= {};
	keyStorage[currentSlotIdStorage]= slotId;
	chrome.storage.local.set(keyStorage, () => {
		callback();
	});	
}

//Used to get the current slot id (EXTERNAL)
//callback -> function which receives the string value or null if it's not exist
function getCurrentSlotId(callback){
	chrome.storage.local.get([currentSlotIdStorage], value => {
		if (typeof value[currentSlotIdStorage] === "undefined"){
			onSessionClosed();
			callback(null);
		} else {
			callback(value[currentSlotIdStorage]);
		}
	});
}

//Used to store the urls necessary to check the following requests (EXTERNAL)
//urls -> a string array with the urls to be stored
//mode -> if it's a whitelist or a blacklist using format {whitelist: true/false}, if it's false it'll be a blacklist
//slotId -> a string with the value
//callback -> a callback function called when the process ends
function storeUrl(urls, mode, slotId, callback){
	var auxUrls= [];
	if (urls != null && Array.isArray(urls)){
		for (var i= 0; i < urls.length; ++i){
			if (typeof urls[i] === "string" && getMainDomain(urls[i]) != null){
				auxUrls.push(urls[i]);
			}
		}
	} else {
		throw "The urls param should be a string array";
	}
	if (mode != null && mode.whitelist != null && typeof mode.whitelist === "boolean"){
		setSlotId(slotId, () => {});
		setListMode(mode.whitelist, () => {
			var keyArray= {};
			keyArray[cacheLocalStorage]= auxUrls;
			chrome.storage.local.set(keyArray, () => {
				var hashUrls= calculateHash(auxUrls, mode);
				storeHash(hashUrls, callback);
			});
		});
	} else {
		throw "The mode param is incorrect";
	}
}

//Used to get the hash of the urls and the list mode
//urls -> the string array with urls
//mode -> if it's a whitelist or a blacklist using format {whitelist: true/false}, if it's false it'll be a blacklist
function calculateHash(urls, mode){
	var stringUrls= mode.whitelist.toString();
	for (var i= 0; i < urls.length; ++i){
		stringUrls+= urls[i];
	}
	var hashUrls= md5(stringUrls);
	return hashUrls;
}

//Used to store the hash
//hashUrls -> string with the information hashed
//callback -> a callback function to call when the process ends
function storeHash(hashUrls, callback){
	var keyArray= {};
	keyArray[hashLocalStorage]= hashUrls;
	chrome.storage.local.set(keyArray, () => {
		callback();
	});
}

//Used to know if the cache is not manipulated
//callback -> a callback function which receives a boolean param
function checkUrlsAreIntact(callback){
	chrome.storage.local.get([cacheLocalStorage], value1 => {
		var urls= value1 != null && typeof value1[cacheLocalStorage] !== "undefined" ? value1[cacheLocalStorage] : null;
		chrome.storage.local.get([whiteListCheckLocalStorage], value2 => {
			var mode= value2 != null && typeof value2[whiteListCheckLocalStorage] !== "undefined" ? {whitelist: value2[whiteListCheckLocalStorage]} : null;
			if (urls == null || mode == null){
				callback(false);
			} else{
				var currentHash= calculateHash(urls, mode);
				chrome.storage.local.get([hashLocalStorage], value => {
					if (value != null && value[hashLocalStorage] === currentHash){
						callback(true);
					} else{
						callback(false);
					}
				});
			}
		});
	});
}

//Used to set the list mode
//value -> a boolean value (false -> blacklist mode, true -> whitelist mode)
//callback -> a callback called when the process ends
function setListMode(value, callback){
	if (value == null || typeof value !== "boolean"){
		throw "The value param is not valid";
	}
	var keyArray= {};
	keyArray[whiteListCheckLocalStorage]= value;
	chrome.storage.local.set(keyArray, () => {
		callback();
	});
}

//Used to enable the whitelist mode
//callback -> a callback called when the process ends
function enableWhiteListMode(callback){
	setListMode(true, callback);
}

//Used to enable the blacklist mode
//callback -> a callback called when the process ends
function enableBlackListMode(callback){
	setListMode(false, callback);
}

//Used to know if the mode whitelist is activated
//callback -> a callback which receives a boolean param with the result
function isWhiteListMode(callback){
	chrome.storage.local.get([whiteListCheckLocalStorage], value => {
		callback(value[whiteListCheckLocalStorage]);		
	});
}

//Used to know if the mode blacklist is activated
//callback -> a callback which receives a boolean param with the result
function isBlackListMode(callback){
	chrome.storage.local.get([whiteListCheckLocalStorage], value => {
		callback(!value[whiteListCheckLocalStorage]);		
	});
}

//Used to check if the url is allowed or not (EXTERNAL)
//url -> a string with the url to be checked
//callback -> a callback function which receives a boolean param with the result
function checkAllowedUrl(url, callback){
	var mainDomain= getMainDomain(url); //Used to check the url is correct
	if (mainDomain == null){
		callback(false);
	} else{
		checkUrlsAreIntact(result => {
			if (result){
				chrome.storage.local.get([cacheLocalStorage], value => {
					var arrayUrls= value[cacheLocalStorage];
					manageUrlWithMode(url, arrayUrls, callback);
				});
			} else{
				onSessionClosed();
				callback(false);
			}
		});
	}
}

//Used to compare the mainDomain
//url -> string with the complete URL
//arrayUrls -> a string array with URLs
//return boolean
function isMainDomainOnArray(url, arrayUrls){
	var mainDomain= getMainDomain(url);
	for (var i= 0; i < arrayUrls.length; ++i){
		var auxMainDomain= getMainDomain(arrayUrls[i]);
		if (auxMainDomain === mainDomain){
			return true;
		}
	}
	return false;
}

//Used to check the url with the current list mode
//url -> a string with the url to be checked
//arrayUrls -> a string array with the urls stored on cacheLocalStorage
//callback -> a callback function which receives a boolean param with the result
function manageUrlWithMode(url, arrayUrls, callback){
	chrome.storage.local.get([whiteListCheckLocalStorage], value => {
		var whiteListMode= value[whiteListCheckLocalStorage];
		if (whiteListMode){
			if (isMainDomainOnArray(url, arrayUrls)){
				callback(true);
			} else{
				callback(false);
			}
		} else { //blacklist
			if (isMainDomainOnArray(url, arrayUrls)){
				callback(false);
			} else{
				callback(true);
			}
		}
	});
}

//Used to know if the urls are stored on cache (EXTERNAL)
//callback -> a callback which receives a boolean param with the result
function isCacheReady(callback){
	chrome.storage.local.get([cacheLocalStorage], value => {
		if (value == null || typeof value[cacheLocalStorage] === "undefined"){
			callback(false);
		} else {
			checkUrlsAreIntact(result => {
				if (result){
					callback(true);
				} else {
					callback(false);
				}
			});			
		}
	});
}