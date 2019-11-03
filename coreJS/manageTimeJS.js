//Used to set the start time received by the server and set the differences with the pc time (EXTERNAL)
//startTime -> the time in ms
//callback -> a callback function to call when the process ends
function storeStartTime(startTime, callback){
	var keyStorage= {};
	keyStorage[initialTimeStorage]= startTime;
	var keyStorage2= {};
	keyStorage2[timeDifferencesStorage]= startTime - Date.now(); //Used to know the difference between the pc hour and the server one
	chrome.storage.local.set(keyStorage, () => {
		chrome.storage.local.set(keyStorage2, () => {
			callback();
		});	
	});	
}

//Used to get the current time (EXTERNAL)
//callback -> a callback function which receives the time and a boolean param (true if the data is correct and false in other case)
function getCurrentTime(callback){
	chrome.storage.local.get([timeDifferencesStorage], value => {
		try{
			if (typeof value[timeDifferencesStorage] === "undefined"){
				callback(Date.now(), false);
			} else {
				callback(Date.now() + parseInt(value[timeDifferencesStorage]), true);
			}
		}catch(e){
			callback(Date.now(), false);
		}
	});
}

//Used to get the start time value (EXTERNAL)
//callback -> a callback function which receives the value (null if it's not stored)
function getStartTime(callback){
	chrome.storage.local.get([initialTimeStorage], value => {
		if (typeof value[initialTimeStorage] === "undefined" || !Number.isInteger(value[initialTimeStorage])){
			callback(null);
		} else {
			callback(value[initialTimeStorage]);
		}
	});
}