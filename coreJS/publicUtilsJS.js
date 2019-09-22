//Used to remove navigation data when session is closed
function onSessionClosed(){
	chrome.storage.local.remove([tkLocalStorage]);
	localStorage.removeItem(urlLocalStorage);
	disableToF(() => {});
	chrome.browsingData.remove({}, 
	{
		"appcache": true,
        "cache": true,
        "cacheStorage": true,
        "cookies": true,
		"formData": true,
        "history": true,
        "indexedDB": true,
		"localStorage": true,
		"serverBoundCertificates": true,
        "pluginData": true,
        "passwords": true,
        "serviceWorkers": true,
        "webSQL": true
	}, () => {});
}

//Used to control the tabs update without exceptions
function updateTab(tabId, newUrl){
	if (!isNaN(tabId) && tabId > -1){
		chrome.tabs.get(tabId, tab => { //Check if tab exists
			if (tab != null && !isNaN(tab.id) && tab.id > -1){
				chrome.tabs.update(tab.id, {url: newUrl});
			}
		});
	}
}

//Used to show notifications on windows tray
function showTrayNotification(priority, title, message){
	chrome.notifications.create({type: "basic", priority: priority, requireInteraction: true, iconUrl: "../images/icon32.png", title: title, message: message});
}

//Used to make requests
//httpMethod -> the http method used to make the request (POST, GET...)
//url -> the url to make the request
//postParams -> if it's not needed use "", if needed provide a string with the information
//headers -> an array with value pairs with the name of the header and the content. Ej. [{name: 'header1', value: 'contentOfHeader1'}, {name: 'header2', value: 'contentOfHeader2'}]
//functionToRun -> a function which receives the xhr param
//catchFunction -> a function to run when something goes wrong
function makeRequest(httpMethod, url, postParams, headers, functionToRun, catchFunction){
	var xhr = new XMLHttpRequest();
	xhr.open(httpMethod.toUpperCase(), url, true);
	for (var i= 0; i < headers.length; ++i){
		var headerName= headers[i].name;
		var headerValue= headers[i].value;
		xhr.setRequestHeader(headerName, headerValue);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			try{
				functionToRun(xhr);
			}catch(e){ //If the API server has an error
				catchFunction();
			}
		}
	}
	xhr.send(postParams);
}



