//Used to remove the user basic data when the token expires
function tokenExpired(){
	showTrayNotification(1, "Información", "Tu inicio de sesión ha expirado, vuelva a iniciar sesión si desea seguir navegando.");
	stopProgrammedFunctions();
	chrome.storage.local.remove([tkLocalStorage]);
	chrome.storage.local.remove([currentSlotIdStorage]);
	chrome.storage.local.remove([cacheLocalStorage]);
	chrome.storage.local.remove([whiteListCheckLocalStorage]);
	chrome.storage.local.remove([hashLocalStorage]);
	chrome.storage.local.remove([userIdLocalStorage]);
	chrome.storage.local.remove([actTimStorage]);
	chrome.storage.local.remove([actBolStorage]);
	chrome.storage.local.remove([actHsStorage]);
	removeAllHistory();
}

//Used to manage when the token expires
//expireTime -> the time in ms when the token expires
function manageExpireTime(expireTime){
	if (expireTime != null && expireTime > 0){
		getStartTime(startTime => {
			startTime= startTime != null ? startTime : expireTime - 10000; //If startTime is not stored use expireTime minus 10 seconds to ask for loggin again
			var whenToLaunch= expireTime - startTime;
			var tkExpire= setTimeout(tokenExpired, whenToLaunch);
			programmedTimeoutFunctions.push(tkExpire);
		});
	}
}

//Used to stop all the programmed functions
function stopProgrammedFunctions(){
	for (var i= 0; i < programmedTimeoutFunctions.length; ++i){
		clearTimeout(programmedTimeoutFunctions[i]);
	}
	programmedTimeoutFunctions= [];
	for (var i= 0; i < programmedIntervalFunctions.length; ++i){
		clearInterval(programmedIntervalFunctions[i]);
	}
	programmedIntervalFunctions= [];
}

//Used to remove navigation data when session is closed
function onSessionClosed(){
	stopProgrammedFunctions();
	removeAllHistory();
	chrome.storage.local.remove([tkLocalStorage]);
	disableToF(() => {});
	chrome.storage.local.remove([cacheLocalStorage]);
	chrome.storage.local.remove([currentSlotIdStorage]);
	chrome.storage.local.remove([whiteListCheckLocalStorage]);
	chrome.storage.local.remove([hashLocalStorage]);
	chrome.storage.local.remove([userIdLocalStorage]);
	chrome.storage.local.remove([actTimStorage]);
	chrome.storage.local.remove([actBolStorage]);
	chrome.storage.local.remove([actHsStorage]);
	chrome.browsingData.remove({}, 
	{
		"appcache": true,
        "cache": true,
        "cacheStorage": true,
        "cookies": true,
		"formData": true,
        "history": true,
        "indexedDB": true,
		"serverBoundCertificates": true,
        "pluginData": true,
        "passwords": true,
        "serviceWorkers": true,
        "webSQL": true
	}, () => {});
}

//Used to manage the messages send by the client content pages
//callback -> a callback with params: message (with the information), sender (who sends the message) and callback (with the response)
chrome.runtime.onMessage.addListener((message, sender, callback) => {
	if (sender.url.indexOf(loginPageUrl) != -1){ //If it's called by the loginPage
		var username= message["username"].replace(/\s/g,"");
		var passw= message["passw"].replace(/\s/g,"");
		var urlString= message["urlString"];
		getInternalIPs(ips => {
			var jsonRequest= JSON.stringify({'password': passw, 'username': username, 'ips': ips});
			//Make the request to the API
			makeRequest("POST", 
					apiURL + apiLoginUrl,
					jsonRequest,
					[{name: 'Content-type', value: 'application/json;charset=UTF-8'}],
					xhr => {
						var resp = JSON.parse(xhr.responseText);
						if (resp.access === true) { //If access is granted
							storeStartTime(resp.currentTime, () => { //Used to grant that the initial time is stored
								var urlSearch= new URL(urlString);
								var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
								var tabId= urlSearch.searchParams.get(tabCode);
								var keyStorage= {};
								keyStorage[tkLocalStorage]= resp.token;
								chrome.storage.local.set(keyStorage, () => {
									uploadNotificationCacheTof(); //Used to upload the notifications produced when extension is on tof mode
									callback({result: messageKey_correct});
									manageExpireTime(resp.timeExpires);
									manageSlots(resp.slots, () => { //To control when the different restrictions are applied
										var keyStorage2= {};
										keyStorage2[userIdLocalStorage]= username.toUpperCase();
										chrome.storage.local.set(keyStorage2, () => {
											notifyAction("1134", "");
											updateTab(parseInt(tabId), url);
										});								
									});
								});	
							});				
						} else {
							callback({result: messageKey_incorrect});
						}
					},
					() => { //If a server error occurred
						callback({result: messageKey_serverError});
						var keyStorage2= {};
						keyStorage2[userIdLocalStorage]= username;
						chrome.storage.local.set(keyStorage2, () => {
							enableToF(() => {
								var urlSearch= new URL(urlString);
								var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
								var tabId= urlSearch.searchParams.get(tabCode);
								updateTab(parseInt(tabId), url);
							});
						});	
					}
			);
		});
		return true; //To ensure the response is managed asynchronously and the channel is not closed
	} else if (sender.url.indexOf(closeSessionPageUrl) != -1){ //If it's called by the closeSessionPopUp
		var type= message["type"];
		if (type === messageKey_checkTk){ //If it's called to check the token
			chrome.storage.local.get([tkLocalStorage], value => {
				if (typeof value[tkLocalStorage] === "undefined"){ //If there is no token, the actionPage button gets disabled
					isOnToF(tofValue => {
						if (tofValue){
							callback({result: messageKey_onToF});
						} else{
							callback({result: messageKey_disconnected});
						}
					});
				} else {
					callback({result: messageKey_connected});
				}
			});
		} else if (type === messageKey_closeSession){ //If it's called to logout
			onSessionClosed();
			callback({});
		}
		return true; //To ensure the response is managed asynchronously and the channel is not closed
	}
});