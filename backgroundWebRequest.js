var apiURL= "http://ec2-54-149-155-245.us-west-2.compute.amazonaws.com:7991";
var waitPageUrl= chrome.runtime.getURL("/waitingResponse.html");
var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/withoutLogIn.html");
var serverErrorPagePageUrl= chrome.runtime.getURL("/serverErrorPage.html");
var urlCode= "url_";

chrome.webNavigation.onBeforeNavigate.addListener(result => {
	if (result.parentFrameId === -1){ //If it's not the main frame and therefore it's not a main request	
		if (result.url.indexOf(apiURL) === -1) { //If it's not a connection to the API REST
			if (localStorage.getItem("url") !== decodeURI(result.url)){ //If the url has not been allowed yet
				//Start to analize the request
				chrome.tabs.get(result.tabId, tab => {
					chrome.storage.local.get(['tkUser'], value => checkToken(value, decodeURI(result.url), tab));
				});					
			}
		}		
	}
});

async function checkRequestAPI(token, urlDecoded, tab){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", apiURL + "/api/std/checkAccess?" + urlCode + "=" + encodeURIComponent(urlDecoded), true);
	xhr.setRequestHeader('uInfo', token);
	//While the API provides a response
	chrome.tabs.update(tab.id, {url: waitPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			try{
				var resp = JSON.parse(xhr.responseText);
				if (resp.access === true && resp.privileges === true){ //If access is granted
					localStorage.setItem("url", urlDecoded);
					chrome.tabs.update(tab.id, {url: urlDecoded});
				} else if (resp.access === true && resp.privileges === false) { //If access is denied
					localStorage.removeItem("url");
					chrome.tabs.update(tab.id, {url: bannedPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
				} else if (resp.access === false) { //If token has expired
					localStorage.removeItem("url");
					chrome.storage.local.remove(['tkUser'], () => checkToken(undefined, urlDecoded, tab));
				}
			}catch(e){ //If the API server has an error
				localStorage.removeItem("url");
				chrome.tabs.update(tab.id, {url: serverErrorPagePageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
			}
		}
	}
	xhr.send();	
}


chrome.webNavigation.onCommitted.addListener(details => { //When a navigation is committed
	//Used to avoid users go back to extension pages
	if (details.transitionQualifiers.includes("forward_back")){ //If user go back
		if (details.url.indexOf(chrome.runtime.id) != -1){
			chrome.history.deleteUrl({url: details.url});
			chrome.tabs.goBack(details.tabId, () => {});
		}
	}
});

chrome.history.onVisited.addListener(result => { //Avoid save history of extension pages
	if (result.url.indexOf(chrome.runtime.id) != -1){
		chrome.history.deleteUrl({url: result.url});
	}
});

chrome.runtime.onStartup.addListener(() => { //When the browser is opened
	onSessionClosed();
});

function onSessionClosed(){
	chrome.storage.local.remove(['tkUser']);
	localStorage.removeItem("url");
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

async function checkToken(value, urlDecoded, tab){
	if (typeof value === "undefined" || typeof value.tkUser === "undefined"){ //If not token is stored the request is redirected to the loginPageUrl
		localStorage.removeItem("url");
		chrome.tabs.update(tab.id, {url: loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
	} else {
		checkRequestAPI(value.tkUser, urlDecoded, tab);
	}
}