chrome.webNavigation.onCommitted.addListener(result => { //When a navigation is committed
	localStorage.removeItem(encodeURIComponent(decodeURI(result.url))); //To remove it because it's not a download
	if (result.transitionQualifiers.includes("forward_back")){ //If the user go back
		manageGoBack(result.tabId);
	}
	if (result.parentFrameId === -1 && !result.transitionQualifiers.includes("forward_back")){ //If it's the main frame and therefore it's a main request	
		if (result.url.indexOf(apiURL) === -1 && result.url.indexOf(extensionMainUrl) === -1 && result.url !== chromeStartPage) { //If it's not a connection to the API REST and it's not a connection to the extension web pages
			processRequest(false, result.tabId, result.url, response => {
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

function processRequest(download, tabId, url, callback){
	isCacheReady(result => {
		if (result) { //Process the url requested
			checkAllowedUrl(decodeURI(url), result2 => {
				callback(result2);
			});
		} else{ //Redirect to login page
			checkExtensionActivation((correctValue, activated) => { //Check if the extension is activated
				if (correctValue === false){
					getTodaySlots(activated => {
						if (activated === true){
							if (download) callback(false);
							chrome.tabs.get(parseInt(tabId), tab => {
								goToLoginPage(decodeURI(url), tab);
							});							
						} else{
							uploadNotificationCacheTof(); //Used to upload the notifications produced when extension is on tof mode
						}
					});
				} else {
					if (activated === true){
						if (download) callback(false);
						chrome.tabs.get(parseInt(tabId), tab => {
							goToLoginPage(decodeURI(url), tab);
						});
					}
				}
			});
		}
	});
}

function goToBannedPage(urlDecoded, tab){
	if (tab != null){
		updateTab(tab.id, bannedPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
	}
	isOnToF(result => {
		if (result === false){
			notifyAction("1139", urlDecoded); //Notifies the action if it's not in ToF mode
		}
	});	
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
	if (item.state === "in_progress"){ //To avoid completed downloads
		var tabId= localStorage.getItem(encodeURIComponent(decodeURI(item.url)));
		localStorage.removeItem(encodeURIComponent(decodeURI(item.url)));
		processRequest(true, parseInt(tabId), item.url, response => {
			if (!response){ //If it's not allowed
				chrome.downloads.cancel(item.id, () => {
					try{ //Used to avoid problems when a download gets stuck on memory browsers
						chrome.tabs.get(parseInt(tabId), tab => {
							goToBannedPage(decodeURI(item.url), tab);
						});
					}catch(e){}
				});
			} else{
				try{
					var tabIdInt = parseInt(tabId);
					chrome.tabs.get(tabIdInt, tab => {
						if (tab.url.indexOf(extensionMainUrl) !== -1){
							updateTab(tabIdInt, newTabChrome);
						}
					});
				}catch(e){}
			}
		});
	}
});