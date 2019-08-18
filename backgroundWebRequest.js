var apiURL= "http://ec2-54-149-155-245.us-west-2.compute.amazonaws.com:7991";
var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/withoutLogIn.html");
var waitingPageUrl= chrome.runtime.getURL("/waitingResponse.html");
var serverErrorPagePageUrl= chrome.runtime.getURL("/serverErrorPage.html");
var urlCode= "url_";
var tabCode= "tb_";

chrome.webNavigation.onCommitted.addListener(result => { //When a navigation is committed
	localStorage.removeItem(encodeURIComponent(decodeURI(result.url)));
	if (result.transitionQualifiers.includes("forward_back")){ //If user go back
		//Used to avoid users go back to extension pages
		if (result.url.indexOf("chrome-extension://" + chrome.runtime.id + "/") != -1){
			chrome.history.deleteUrl({url: result.url});
			setTimeout(function(){
				chrome.tabs.goBack(result.tabId, () => { //goBack twice to avoid the current page gets repeated
					setTimeout(function(){
						chrome.tabs.goBack(result.tabId, () => {});
					}, 100);
				}); 
			}, 100);
		}
	}
	if (result.parentFrameId === -1 && !result.transitionQualifiers.includes("forward_back")){ //If it's the main frame and therefore it's a main request	
		if (result.url.indexOf(apiURL) === -1 && result.url.indexOf("chrome-extension://" + chrome.runtime.id + "/") === -1) { //If it's not a connection to the API REST and it's not a connection to the extension web pages
			if (localStorage.getItem("url") !== decodeURI(result.url)){ //If the url has not been allowed yet
				//Start to analize the request
				chrome.tabs.update(result.tabId, {url: waitingPageUrl + "?" + urlCode + "=" + result.url});
				chrome.tabs.get(result.tabId, tab => {
					chrome.storage.local.get(['tkUser'], value => checkToken(value, decodeURI(result.url), tab));
				});	
			}
		}		
	}
});

chrome.webNavigation.onBeforeNavigate.addListener(result => { //Used to know the tabId on downloads
	localStorage.setItem(encodeURIComponent(decodeURI(result.url)), result.tabId);
});

chrome.downloads.onCreated.addListener(item => { //Used to stop or allow downloads
	var tabId= localStorage.getItem(encodeURIComponent(decodeURI(item.url)));
	localStorage.removeItem(encodeURIComponent(decodeURI(item.url)));
	if (localStorage.getItem("url") !== decodeURI(item.url)){ //If the url has not been allowed yet
		//Cancel the download
		chrome.downloads.cancel(item.id, () => {
			//Start to analize the request
			chrome.tabs.get(parseInt(tabId), tab => {
				chrome.storage.local.get(['tkUser'], value => checkToken(value, decodeURI(item.url), tab));
			});	
		});				
	} else { //Returns to startpage
		chrome.tabs.update(parseInt(tabId), {url: "chrome://newtab"});
	}
});

function checkRequestAPI(token, urlDecoded, tab){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", apiURL + "/api/std/checkAccess?" + urlCode + "=" + encodeURIComponent(urlDecoded), true);
	xhr.setRequestHeader('uInfo', token);
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
				if (!isNaN(tab.id) && tab.id > -1){
					chrome.tabs.update(tab.id, {url: serverErrorPagePageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
				}
			}
		}
	}
	xhr.send();
}

chrome.history.onVisited.addListener(result => { //Avoid save history of extension pages
	if (result.url.indexOf("chrome-extension://" + chrome.runtime.id + "/") != -1){
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

function checkToken(value, urlDecoded, tab){
	if (typeof value === "undefined" || typeof value.tkUser === "undefined"){ //If not token is stored the request is redirected to the loginPageUrl
		localStorage.removeItem("url");
		chrome.tabs.update(tab.id, {url: loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded) + "&" + tabCode + "=" + tab.id});
	} else {
		checkRequestAPI(value.tkUser, urlDecoded, tab);
	}
}