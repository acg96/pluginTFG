//When a bookmark is created it gets deleted
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
	showTrayNotification(1, "Acción no válida", "No se permite añadir marcadores.");
	chrome.bookmarks.remove(id);
});

//When the browser is opened the information of the browser it gets deleted
chrome.runtime.onStartup.addListener(() => {
	onSessionClosed();
});

//Used to manage the messages send by the client content pages
//callback -> a callback with params: message (with the information), sender (who sends the message) and callback (with the response)
chrome.runtime.onMessage.addListener((message, sender, callback) => {
	if (sender.url.indexOf(loginPageUrl) != -1){ //If it's called by the loginPage
		var username= message["username"].replace(/\s/g,"");
		var passw= message["passw"].replace(/\s/g,"");
		var urlString= message["urlString"];
		var jsonRequest= JSON.stringify({'password': passw, 'username': username});
		//Make the request to the API
		makeRequest("POST", 
				apiURL + apiLoginUrl,
				jsonRequest,
				[{name: 'Content-type', value: 'application/json;charset=UTF-8'}],
				xhr => {
					var resp = JSON.parse(xhr.responseText);
					if (resp.access === true) { //If access is granted
						var urlSearch= new URL(urlString);
						var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
						var tabId= urlSearch.searchParams.get(tabCode);
						var keyStorage= {};
						keyStorage[tkLocalStorage]= resp.token;
						chrome.storage.local.set(keyStorage, () => {
							callback({result: messageKey_correct});
							//TODO CARGAR CACHE LOCAL storeUrl(urls, mode, callback)
							updateTab(parseInt(tabId), url);
						});					
					} else {
						callback({result: messageKey_incorrect});
					}
				},
				() => { //If a server error occurred
					callback({result: messageKey_serverError});
					enableToF(() => {
						var urlSearch= new URL(urlString);
						var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
						var tabId= urlSearch.searchParams.get(tabCode);
						updateTab(parseInt(tabId), url);
					});
				}
		);
		return true; //To ensure the response is managed asynchronously and the channel is not closed
	} else if (sender.url.indexOf(bannedPageUrl) != -1){ //If it's called by the bannedPage
		isOnToF(result => {
			if (result){
				callback({result: messageKey_onToF});
			} else{
				callback({result: messageKey_noToF});
			}
		});
		return true; //To ensure the response is managed asynchronously and the channel is not closed
	} else if (sender.url.indexOf(closeSessionPageUrl) != -1){ //If it's called by the closeSessionPopUp
		var type= message["type"];
		if (type === messageKey_checkTk){ //If it's called to check the token
			chrome.storage.local.get([tkLocalStorage], value => {
				if (typeof value[tkLocalStorage] === "undefined"){ //If there is no token, the actionPage button gets disabled
					callback({result: messageKey_disconnected});
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