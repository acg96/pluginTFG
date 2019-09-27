//Used to store the urls necessary to check the following requests (EXTERNAL)
//urls -> a string array with the urls to be stored
//mode -> if it's a whitelist or a blacklist using format {whitelist: true/false}, if it's false it'll be a blacklist
//callback -> a callback function called when the process ends
function storeUrl(urls, mode, callback){
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
		var urls= value1[cacheLocalStorage];
		chrome.storage.local.get([whiteListCheckLocalStorage], value2 => {
			var mode= {whitelist: value2[whiteListCheckLocalStorage]};
			var currentHash= calculateHash(urls, mode);
			chrome.storage.local.get([hashLocalStorage], value => {
				if (value != null && value[hashLocalStorage] === currentHash){
					callback(true);
				} else{
					callback(false);
				}
			});
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
	var mainDomain= getMainDomain(url);
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

//Used to check the url with the current list mode
//url -> a string with the url to be checked
//arrayUrls -> a string array with the urls stored on cacheLocalStorage
//callback -> a callback function which receives a boolean param with the result
function manageUrlWithMode(url, arrayUrls, callback){
	chrome.storage.local.get([whiteListCheckLocalStorage], value => {
		var whiteListMode= value[whiteListCheckLocalStorage];
		if (whiteListMode){
			if (arrayUrls.includes(url)){
				callback(true);
			} else{
				callback(false);
			}
		} else { //blacklist
			if (arrayUrls.includes(url)){
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