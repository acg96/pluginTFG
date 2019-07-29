var extID= "pnhepmckfbdbllddbmfobfeccpkkcgpg";
var apiURL= "http://localhost:7991";
var chromeExtScheme= "chrome-extension://";
var waitPageUrl= chromeExtScheme + extID +"/waitingResponse.html";
var bannedPageUrl= chromeExtScheme + extID +"/bannedRequest.html";
var loginPageUrl= chromeExtScheme + extID +"/withoutLogIn.html";
var urlCode= "url_";

chrome.runtime.onInstalled.addListener(() => {
	localStorage.removeItem("url");
    chrome.webRequest.onBeforeRequest.addListener(
        result => {
			if (result.type !== "main_frame"){ //If it's not a main request
				return {};
			}
			if (result.url.indexOf(apiURL) != -1 && result.initiator === undefined) { //If it's a connection to the API REST
				return {};
			}
			if (localStorage.getItem("url") === result.url){ //If the url has been allowed last time
				return {};
			}
            let url = encodeURIComponent(result.url);
            let response = {redirectUrl: waitPageUrl + "?" + urlCode + "=" + url}; //Redirect the request to the waitPageUrl
			return response;
        }, {urls: ["*://*/*"]}, ["blocking"]);
});

async function checkRequestAPI(token, urlDecoded, tab){ //TODO
	localStorage.setItem("url", urlDecoded);
	chrome.tabs.create({url: urlDecoded});
	
	
	//Remove localStorage.url if it's not allowed the current request either being needed to be logged in or being denied
	//AJAX request to ensure the user has privileges TODO
	/*var xhr = new XMLHttpRequest();
	xhr.open("GET", "localhost:7991/api/", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // JSON.parse does not evaluate the attacker's scripts.
    var resp = JSON.parse(xhr.responseText);
  }
}
xhr.send();*/
	
}
  
chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { //When a tab is updated
		let urlStr= tab.url;
		let urlSearch= new URL(urlStr);
		let url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
		let isWaitingPage= urlStr.indexOf(waitPageUrl) != -1 && changeInfo.status === "complete";
		if (isWaitingPage) { //If is waitingPage is meant that it needs to be checked the token and the privileges of the requested url
			chrome.tabs.remove(tab.id, ()=>{});
			chrome.storage.local.get(['tkUser'], value => checkToken(value, url, tab));
		}
	});
});


async function checkToken(value, urlDecoded, tab){
	if (typeof value.tkUser === "undefined"){ //If not token is stored the request is redirected to the loginPageUrl
		localStorage.removeItem("url");
		chrome.tabs.create({url: loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded)});
	} else {
		checkRequestAPI(value, urlDecoded, tab);
	}
}