chrome.webNavigation.onCommitted.addListener(result => { //When a navigation is committed
	localStorage.removeItem(encodeURIComponent(decodeURI(result.url))); //To remove it because it's not a download
	if (result.transitionQualifiers.includes("forward_back")){ //If the user go back
		manageGoBack(result.tabId);
	}
	if (result.parentFrameId === -1 && !result.transitionQualifiers.includes("forward_back")){ //If it's the main frame and therefore it's a main request	
		if (result.url.indexOf(apiURL) === -1 && result.url.indexOf(extensionMainUrl) === -1) { //If it's not a connection to the API REST and it's not a connection to the extension web pages
			processRequest(result.tabId, result.url, response => {
				if (!response){ //If it's not allowed
					chrome.tabs.get(result.tabId, tab => {
						goToBannedPage(decodeURI(result.url), tab);
					});
				} else{
					addToHistory(result.tabId, decodeURI(result.url)); //Save on the go back history
				}
			});
		}		
	}
});

function processRequest(tabId, url, callback){
	isCacheReady(result => {
		if (result) { //Process the url requested
			checkAllowedUrl(decodeURI(url), result => {
				callback(result);
			});
		} else{ //Redirect to login page
			chrome.tabs.get(tabId, tab => {
				goToLoginPage(decodeURI(url), tab);
			});
		}
	});
}

function goToBannedPage(urlDecoded, tab){
	updateTab(tab.id, bannedPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
	//Avisar a la api enviando el token si no es tOf TODO
}

function goToLoginPage(urlDecoded, tab){
	chrome.storage.local.remove([tkLocalStorage], () => {
		updateTab(tab.id, loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded) + "&" + tabCode + "=" + tab.id);
	});
}

chrome.webNavigation.onBeforeNavigate.addListener(result => { //Used to know the tabId on downloads
	localStorage.setItem(encodeURIComponent(decodeURI(result.url)), result.tabId);
});

chrome.downloads.onCreated.addListener(item => { //Used to stop or allow downloads
	var tabId= localStorage.getItem(encodeURIComponent(decodeURI(item.url)));
	localStorage.removeItem(encodeURIComponent(decodeURI(item.url)));
	processRequest(tabId, item.url, response => {
		if (!response){ //If it's not allowed
			chrome.downloads.cancel(item.id, () => {
				try{ //Used to avoid problems when a download gets stuck on memory browsers
					chrome.tabs.get(parseInt(tabId), tab => {
						goToBannedPage(decodeURI(item.url), tab);
					});
				}catch(e){}
			});
		}
	});
});