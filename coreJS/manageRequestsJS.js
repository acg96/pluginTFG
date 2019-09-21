chrome.webNavigation.onCommitted.addListener(result => { //When a navigation is committed
	localStorage.removeItem(encodeURIComponent(decodeURI(result.url))); //To remove it because it's not a download
	if (result.transitionQualifiers.includes("forward_back")){ //If the user go back
		manageGoBack(result.tabId);
	}
	if (result.parentFrameId === -1 && !result.transitionQualifiers.includes("forward_back")){ //If it's the main frame and therefore it's a main request	
		if (result.url.indexOf(apiURL) === -1 && result.url.indexOf(extensionMainUrl) === -1) { //If it's not a connection to the API REST and it's not a connection to the extension web pages
			if (localStorage.getItem(urlLocalStorage) !== decodeURI(result.url)){ //If the url has not been allowed yet
				//Start to analize the request
				updateTab(result.tabId, waitingPageUrl + "?" + urlCode + "=" + result.url);
				chrome.tabs.get(result.tabId, tab => {
					chrome.storage.local.get([tkLocalStorage], value => checkToken(value, decodeURI(result.url), tab));
				});	
			} else {
				addToHistory(result.tabId, decodeURI(result.url));
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
	if (localStorage.getItem(urlLocalStorage) !== decodeURI(item.url)){ //If the url has not been allowed yet
		//Cancel the download
		chrome.downloads.cancel(item.id, () => {
			//Start to analize the request
			try{ //Used to avoid problems when a download gets stuck on memory browsers
				chrome.tabs.get(parseInt(tabId), tab => {
					chrome.storage.local.get([tkLocalStorage], value => checkToken(value, decodeURI(item.url), tab));
				});
			}catch(e){}
		});				
	} else { //Returns to startpage
		updateTab(parseInt(tabId), newTabChrome);
	}
});

function checkRequestAPI(token, urlDecoded, tab){
	makeRequest("GET", 
			apiURL + apiCheckAccess + "?" + urlCode + "=" + encodeURIComponent(urlDecoded), 
			"",
			[{name: headerTkName, value: token}],
			xhr => {
				var resp = JSON.parse(xhr.responseText);
				if (resp.access === true && resp.privileges === true){ //If access is granted
					localStorage.setItem(urlLocalStorage, urlDecoded);
					updateTab(tab.id, urlDecoded);
				} else if (resp.access === true && resp.privileges === false) { //If access is denied
					localStorage.removeItem(urlLocalStorage);
					updateTab(tab.id, bannedPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
				} else if (resp.access === false) { //If token has expired
					localStorage.removeItem(urlLocalStorage);
					showTrayNotification(1, "Información", "Tu inicio de sesión ha expirado, vuelva a iniciar sesión si desea seguir navegando.");
					chrome.storage.local.remove([tkLocalStorage], () => checkToken(undefined, urlDecoded, tab));
				}
			},
			() => {
				localStorage.removeItem(urlLocalStorage);
				if (tab != null){
					updateTab(tab.id, serverErrorPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
				}
			}
	);
}

//Used to check the token and redirect the request
function checkToken(value, urlDecoded, tab){
	if (typeof value === "undefined" || typeof value[tkLocalStorage] === "undefined"){ //If not token is stored the request is redirected to the loginPageUrl
		localStorage.removeItem(urlLocalStorage);
		updateTab(tab.id, loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded) + "&" + tabCode + "=" + tab.id);
	} else {
		checkRequestAPI(value[tkLocalStorage], urlDecoded, tab);
	}
}