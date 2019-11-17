//Used to store the tOf URLs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(details => {
	var tOf= ["http://www.uniovi.es"];
	var keyArray= {};
	keyArray[tOfLocalStorage]= tOf;
	keyArray[tofNotificationsLocalStorage]= [];
	chrome.storage.local.set(keyArray, () => {});
});

//Used to store inside the notifications cache the notifications occurred while tof is enabled
//notification -> a json object with the notification
function storeNotificationOnCacheTof(notification){
	chrome.storage.local.get([tofNotificationsLocalStorage], value => {
		if (value != null && typeof value[tofNotificationsLocalStorage] !== "undefined"){
			var cacheTof= value[tofNotificationsLocalStorage];
			cacheTof.push(notification);
			var keyArray= {};
			keyArray[tofNotificationsLocalStorage]= cacheTof;
			chrome.storage.local.set(keyArray, () => {});
		}
	});
}

//Used to upload the notification cache occurred when the extension is on tof mode
function uploadNotificationCacheTof(){
	chrome.storage.local.get([tofNotificationsLocalStorage], value => {
		if (value != null && typeof value[tofNotificationsLocalStorage] !== "undefined"){
			var cacheTof= value[tofNotificationsLocalStorage];
			if (cacheTof.length > 0){
				notifySomeActions(cacheTof, result => {
					if (result === true){ //If it's correctly uploaded the cache gets deleted
						var keyArray= {};
						keyArray[tofNotificationsLocalStorage]= [];
						chrome.storage.local.set(keyArray, () => {});
					}
				});
			}
		}
	});
}

//Used to know the URLs allowed on ToF
//callback -> callback function with a string array param with the URLs allowed. It stores an empty array if tOf is not activated
function getUrlsOnToF(callback){
	isOnToF(result => {
		if (result){
			chrome.storage.local.get([tOfLocalStorage], value => {
				if (typeof value === "undefined" || typeof value[tOfLocalStorage] === "undefined"){ //If not tOf Urls are defined
					throw "ToF Urls not stored properly";
				} else{
					callback(value[tOfLocalStorage]);
				}
			});			
		} else { //If tOf is not activated
			callback([]);
		}
	});	
}

//Used to enable tOf mode
//callback -> callback function run when the tOf is enabled
function enableToF(callback){
	var keyArray= {};
	keyArray[activatedToFLocalStorage]= true;
	chrome.storage.local.set(keyArray, () => {
		getUrlsOnToF(arrayUrls => {
			storeUrl(arrayUrls, {whitelist: true}, "-1", () => {
				callback();
			});
		});
	});
}

//Used to know if it's on tOf status (EXTERNAL)
//callback -> callback function with a boolean param where the result is stored
function isOnToF(callback){
	chrome.storage.local.get([activatedToFLocalStorage], value => {
		if (typeof value === "undefined" || typeof value[activatedToFLocalStorage] === "undefined"){ //If not tOf is defined
			callback(false);
		} else{
			callback(value[activatedToFLocalStorage]);
		}
	});
}

//Used to disable tOf mode
//callback -> callback function run when the tOf is disabled
function disableToF(callback){
	chrome.storage.local.remove([activatedToFLocalStorage], () => {
		callback();
	});
}

//Used to manage the messages send by the client content pages
//callback -> a callback with params: message (with the information), sender (who sends the message) and callback (with the response)
chrome.runtime.onMessage.addListener((message, sender, callback) => {
	if (sender.url.indexOf(bannedPageUrl) != -1){ //If it's called by the bannedPage
		isOnToF(result => {
			if (result){
				callback({result: messageKey_onToF});
			} else{
				callback({result: messageKey_noToF});
			}
		});
		return true; //To ensure the response is managed asynchronously and the channel is not closed
	}
});

