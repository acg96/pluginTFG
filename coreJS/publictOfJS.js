//Used to enable tOf mode
//callback -> callback function run when the tOf is enabled
function enableToF(callback){
	var keyArray= {};
	keyArray[activatedToFLocalStorage]= true;
	chrome.storage.local.set(keyArray, () => {
		callback();
	});
}

//Used to know if it's on tOf status
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

