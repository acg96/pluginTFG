var apiURL= "http://localhost:7991";
var waitPageUrl= chrome.runtime.getURL("/waitingResponse.html");
var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/withoutLogIn.html");
var serverErrorPagePageUrl= chrome.runtime.getURL("/serverErrorPage.html");
var urlCode= "url_";

localStorage.removeItem("url");

chrome.webRequest.onBeforeRequest.addListener(
	result => {
		if (result.type !== "main_frame"){ //If it's not a main request
			return {};
		}
		if (result.url.indexOf(apiURL) != -1 && result.initiator === undefined) { //If it's a connection to the API REST
			return {};
		}
		if (localStorage.getItem("url") === decodeURI(result.url)){ //If the url has been allowed last time
			return {};
		}		
		let url = encodeURIComponent(decodeURI(result.url));
		let response = {redirectUrl: waitPageUrl + "?" + urlCode + "=" + url}; //Redirect the request to the waitPageUrl
		return response;
	}, {urls: ["*://*/*"]}, ["blocking"]);

async function checkRequestAPI(token, urlDecoded, tab){
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
	chrome.storage.local.remove(['tkUser']);
	localStorage.removeItem("url");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { //When a tab is updated
	let urlStr= tab.url;
	let urlSearch= new URL(urlStr);
	let url= decodeURI(decodeURIComponent(urlSearch.searchParams.get(urlCode)));
	let isWaitingPage= urlStr.indexOf(waitPageUrl) != -1 && changeInfo.status === "complete";
	if (isWaitingPage) { //If is waitingPage is meant that it needs to be checked the token and the privileges of the requested url
		chrome.storage.local.get(['tkUser'], value => checkToken(value, url, tab));
	}
});


async function checkToken(value, urlDecoded, tab){
	if (typeof value === "undefined" || typeof value.tkUser === "undefined"){ //If not token is stored the request is redirected to the loginPageUrl
		localStorage.removeItem("url");
		chrome.tabs.update(tab.id, {url: loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
	} else {
		checkRequestAPI(value.tkUser, urlDecoded, tab);
	}
}