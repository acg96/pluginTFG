var programmedIntervalActivation= null;

//Used to check if there is no slots today (EXTERNAL)
//callback -> a callback function to call when the process ends which receives if the extension is activated or not
function getTodaySlots(callback){
	//Make the request to the API
	makeRequest("GET", 
			apiURL + apiSlotsTodayUrl,
			{},
			[{name: 'Content-type', value: 'application/json;charset=UTF-8'}],
			xhr => {
				var resp = JSON.parse(xhr.responseText);
				var respTime= resp.respTime; //The time returned by the API
				var slotsToday= resp.slotsToday; //boolean with the response
				storeTodaySlotsResponse(respTime, slotsToday, true, callback);
			},
			() => { //If a server error occurred the login page should appear
				getCurrentTime((currentTime, correct) => {
					storeTodaySlotsResponse(currentTime, true, false, callback);
				});	
			}
	);
}

//Used to store the values of the activation
//respTime -> the time in milliseconds since the epoch
//slotsToday -> a boolean value being true if there are slots and therefore the extension should works or false in other case
//correctTime -> a boolean value being true if the time proceeds from the API or false in other case
//callback -> a callback function to call when the process ends which receives if the extension is activated or not
function storeTodaySlotsResponse(respTime, slotsToday, correctTime, callback){
	var keyStorage= {};
	keyStorage[actTimStorage]= respTime;
	var keyStorage2= {};
	keyStorage2[actBolStorage]= slotsToday;	
	var keyStorage3= {};
	keyStorage3[actHsStorage] = calculateHashActivation(respTime, slotsToday);
	setSlotId("-1", () => {});
	chrome.storage.local.set(keyStorage, () => {
		chrome.storage.local.set(keyStorage2, () => {
			chrome.storage.local.set(keyStorage3, () => {
				programIntervalCheckActivation(slotsToday); //To program the interval to check if there are some slots programmed today
				if (correctTime === true){
					storeStartTime(respTime, () => {
						callback(slotsToday);
					});
				} else{
					callback(slotsToday);
				}
			});
		});	
	});
}

//Used to program the interval to check if there are some programmed slots today
//slotsToday -> a boolean param to indicate if the extension should be activated or not
function programIntervalCheckActivation(slotsToday){
	if (programmedIntervalActivation == null && slotsToday === false){
		programmedIntervalActivation= setInterval(getTodaySlots, timeOfCheckActivation, value => {});
		programmedIntervalFunctions.push(programmedIntervalActivation);
	}
}

//Used to know if the activation value is not manipulated (EXTERNAL)
//callback -> a callback function which receives a boolean param being true if the value is correct and false if the value is manipulated or not stored and
//				receives the activation value too
function checkExtensionActivation(callback){
	chrome.storage.local.get([actBolStorage], value1 => {
		var actValue= value1 != null && typeof value1[actBolStorage] !== "undefined" ? value1[actBolStorage] : null;
		chrome.storage.local.get([actTimStorage], value2 => {
			var timeValue= value2 != null && typeof value2[actTimStorage] !== "undefined" ? value2[actTimStorage] : null;
			if (actValue == null || timeValue == null){
				callback(false, false);
			} else{
				var currentHash= calculateHashActivation(timeValue, actValue);
				chrome.storage.local.get([actHsStorage], value => {
					if (value != null && value[actHsStorage] === currentHash){
						programIntervalCheckActivation(actValue); //To program the interval to check if there are some slots programmed today
						callback(true, actValue);
					} else{
						callback(false, false);
					}
				});
			}
		});
	});
}

//Used to get the hash of the activation
//respTime -> the time in milliseconds since the epoch
//slotsToday -> the boolean value of the activation
function calculateHashActivation(respTime, slotsToday){
	var stringValue= respTime.toString() + "-" + slotsToday.toString();
	var hashValue= md5(stringValue);
	return hashValue;
}

