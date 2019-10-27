//Used to manage the notifications to the API
//actionJSON -> a json object with the information
//token -> the token of the current user or an empty string if tof is activated
//time -> used to stop the loop of attemps to store the information (minimum value 0)
function notifyAux(actionJSON, token, time){
	if (time <= numberOfStoreAttemps && time > 0){
		var jsonToSend= {};
		jsonToSend[actionCode]= [];
		jsonToSend[actionCode].push(actionJSON);
		makeRequest("POST", 
				apiURL + apiNotifyAction, 
				JSON.stringify(jsonToSend),
				[{name: headerTkName, value: token}, {name: 'Content-type', value: 'application/json;charset=UTF-8'}],
				xhr => {},
				() => { //If an error occurred
					notifyAux(actionJSON, token, ++time);
				}
		);
	} else if (time > 0 && (token === "" || time > numberOfStoreAttemps)){ //If it's on time of flight or if the API is not responding now stores the notification inside a cache
		actionJSON.cacheTof= true; //Used to notice the API that it's not a hacking attempt due to the fact of notify it with another user token
		storeNotificationOnCacheTof(actionJSON);
	}
}

//Used to notify some actions at the same time (EXTERNAL)
//actions -> a json array with the notifications
//callback -> a callback function which receives a param with the result (true if it's ok or false in any other case)
function notifySomeActions(actions, callback){
	try{
		if (actions != null && actions.length > 0){
			var jsonToSend= {};
			jsonToSend[actionCode]= [];
			for (var i= 0; i < actions.length; ++i){
				jsonToSend[actionCode].push(actions[i]);
			}
			makeRequest("POST", 
					apiURL + apiNotifyAction, 
					JSON.stringify(jsonToSend),
					[{name: headerTkName, value: ""}, {name: 'Content-type', value: 'application/json;charset=UTF-8'}],
					xhr => {
						callback(true);
					},
					() => { //If an error occurred
						callback(false);
					}
			);
		}
	} catch(error){callback(false)} //If the param is not an array
}

//Used to notify actions to API (EXTERNAL)
//action -> A string code to classify the action
//moreData -> Used to provide more data using a string
function notifyAction(action, moreData){
	chrome.storage.local.get([tkLocalStorage, userIdLocalStorage], value => {
		if (value != null){
			getInternalIPs(ips => {
				getCurrentTime((currentTime, correct) => {
					getCurrentSlotId(slotId => {
						slotId= slotId != null ? slotId : "-1";
						var toSend= {
							intIp: ips,
							idUser: value[userIdLocalStorage],
							actTime: currentTime,
							actCode: action,
							moreInfo: moreData,
							cacheTof: false,
							correctTime: correct,
							slotId: slotId
						};
						var tkData= "";
						if (typeof value[tkLocalStorage] !== "undefined"){
							tkData= value[tkLocalStorage];
						}
						isOnToF(result => {
							if ((result === true && tkData === "") || (result === false && tkData !== "")){
								notifyAux(toSend, tkData, 1);
							}
						});
					});
				});				
			});
		}
	});
}