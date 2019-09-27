//Used to know the main domain without matter the subdomain and the protocol
function getMainDomain(href) {
	var mainDomain= null;
	try{
		var url = new URL(href);
		var urlSplit= url.hostname.split(".");
		mainDomain= urlSplit[urlSplit.length - 2] + "." + urlSplit[urlSplit.length - 1];
	}catch(e){}
    return mainDomain;
};

//Used to get the internal IPs interfaces of each computer
//callback -> a callback function which receives a string array param with the response or null if something happens
function getInternalIPs(callback){
	window.RTCPeerConnection = window.RTCPeerConnection;
	var peerRTC= new RTCPeerConnection({iceServers:[]}), noop = function(){};
	peerRTC.createDataChannel('');
	peerRTC.createOffer(peerRTC.setLocalDescription.bind(peerRTC), noop);
	peerRTC.onicecandidate= ice => {
		if (ice && ice.candidate && ice.candidate.candidate){
			textWithIPs= ice.srcElement.pendingLocalDescription.sdp;
			var myIP= textWithIPs.match(/[1-9][0-9]{0,2}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/gm);
			peerRTC.onicecandidate= noop;
			myIP= removeRepeatedIps(myIP);
			callback(myIP);
		} else{
			callback(null);
		}
	};
}

//Used to remove repeated ip addresses inside an array
//ips -> string array with ips
function removeRepeatedIps(ips){
	var newArray= [];
	for (var i= 0; i < ips.length; ++i){
		if (!newArray.includes(ips[i]) && /127|255/.test(ips[i].split(".")[0]) === false){ //Avoid repeated values and not useful ips
			newArray.push(ips[i]);
		}
	}
	return newArray;
}

//Used to notify actions to API
//action -> A string code to classify the action
//moreData -> Used to provide more data using a string
function notifyAction(action, moreData){
	chrome.storage.local.get([tkLocalStorage], value => {
		if (value != null && typeof value[tkLocalStorage] !== "undefined"){
			makeRequest("POST", 
					apiURL + apiNotifyAction, 
					actionCode + "=" + action + "&" + moreInfoCode + "=" + encodeURI(moreData),
					[{name: headerTkName, value: value[tkLocalStorage]}, {name: 'Content-type', value: 'application/x-www-form-urlencoded'}],
					xhr => {
						var resp = JSON.parse(xhr.responseText);
						if (resp.access === false) { //If token has expired
							showTrayNotification(1, "Información", "Tu inicio de sesión ha expirado, vuelva a iniciar sesión si desea seguir navegando.");
							chrome.storage.local.remove([tkLocalStorage]);
						}
					},
					() => {
					}
			);
		}
	});
}

//Used to remove navigation data when session is closed
function onSessionClosed(){
	chrome.storage.local.remove([tkLocalStorage]);
	disableToF(() => {});
	chrome.storage.local.remove([cacheLocalStorage]);
	chrome.storage.local.remove([whiteListCheckLocalStorage]);
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



