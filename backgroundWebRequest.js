var extID= "pnhepmckfbdbllddbmfobfeccpkkcgpg";
var chromeExtScheme= "chrome-extension://";
var waitPageUrl= chromeExtScheme + extID +"/waitingResponse.html";
var bannedPageUrl= chromeExtScheme + extID +"/bannedRequest.html";
var loginPageUrl= chromeExtScheme + extID +"/withoutLogIn.html";
var urlCode= "?url45_li3_32d69_345d_=";

chrome.runtime.onInstalled.addListener(() => {
    chrome.webRequest.onBeforeRequest.addListener(
        result => {
            let url = result.url;
            let response = {redirectUrl: waitPageUrl + urlCode +url};
			return response;
        }, {urls: ["*://*/*"]}, ["blocking"]);
});

async function checkAPI(token, url, tab){
	//AJAX request to ensure the user has privileges
}
  
chrome.runtime.onInstalled.addListener(() => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		let urlStr= tab.url;
		let url= urlStr.split(urlCode)[1];
		let isWaitingPage= urlStr.indexOf(waitPageUrl) != -1 && changeInfo.status === "complete";
		if (isWaitingPage) {
			chrome.tabs.remove(tab.id, ()=>{});
			chrome.storage.local.get(['tkUser'], value => checkToken(value, url, tab));
		}
	});
});


async function checkToken(value, url, tab){
	if (typeof value.tkUser === "undefined"){
		chrome.tabs.create({url: loginPageUrl + urlCode + url});
	} else {
		checkAPI(value, url, tab);
	}
}