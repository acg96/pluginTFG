//Used to store the tOf URLs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(details => {
	var tOf= ["uniovi.es"];
	var keyArray= {};
	keyArray[tOfLocalStorage]= tOf;
	chrome.storage.local.set(keyArray, () => {});
});

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

//Used to disable tOf mode
//callback -> callback function run when the tOf is disabled
function disableToF(callback){
	chrome.storage.local.remove([activatedToFLocalStorage], () => {
		callback();
	});
}

