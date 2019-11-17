//js file used to avoid users go back to extension pages
var historyArray= [];
var indexHistory= [];

//Used to manage navigation when the user go back (EXTERNAL)
function manageGoBack(tabId){
	checkExtensionActivation((correctValue, activated) => {
		if (correctValue === true && activated === true){ //If the extension is activated
			try{
				var desireUrl= newTabChrome;
				if (indexHistory[tabId] > 0){
					--indexHistory[tabId];
					desireUrl= historyArray[tabId][indexHistory[tabId]];
				} else {
					showTrayNotification(1, "Información", "No hay más páginas para ir hacia atrás en el historial. Puede que el sitio donde busca ir esté en otra pestaña.");
					desireUrl= historyArray[tabId][indexHistory[tabId]];
				}
				--indexHistory[tabId];
				updateTab(tabId, desireUrl);
			}catch(e){ //If the history has been deleted because of session closed
				updateTab(tabId, newTabChrome);
			}
		} else if (correctValue === false){
			onSessionClosed();
			updateTab(tabId, newTabChrome);
		}
	});
}

//Used to remove all history when session gets closed
function removeAllHistory(){
	indexHistory = [];
	historyArray = [];
}

//Used to store the navigation to be used when the user go back
function addToHistory(tabId, urlDecoded){
	if (!isNaN(indexHistory[tabId])) {
		++indexHistory[tabId];
	} else {
		indexHistory[tabId]= 0;
		historyArray[tabId]= [];
	}
	historyArray[tabId][indexHistory[tabId]]= urlDecoded;
}

//Used to remove the goback history
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => { 
	if (!isNaN(indexHistory[tabId])) {
		indexHistory[tabId]= -1;
		historyArray[tabId]= [];
	}
});

//Avoid save history of extension pages
chrome.history.onVisited.addListener(result => {
	if (result.url.indexOf(extensionMainUrl) != -1){
		chrome.history.deleteUrl({url: result.url});
	}
});