var apiURL= "http://ec2-54-149-155-245.us-west-2.compute.amazonaws.com:7991/";
var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/withoutLogIn.html");
var waitingPageUrl= chrome.runtime.getURL("/waitingResponse.html");
var serverErrorPagePageUrl= chrome.runtime.getURL("/serverErrorPage.html");
var extensionMainUrl= "chrome-extension://" + chrome.runtime.id + "/";
var newTabChrome= "chrome://newtab";
var apiCheckAccess= "api/std/checkAccess";
var urlCode= "url_";
var tabCode= "tb_";
var historyArray= [];
var indexHistory= [];

chrome.webNavigation.onCommitted.addListener(result => { //When a navigation is committed
	localStorage.removeItem(encodeURIComponent(decodeURI(result.url))); //To remove it because it's not a download
	if (result.transitionQualifiers.includes("forward_back")){ //If the user go back
		//Used to avoid users go back to extension pages
		var desireUrl= newTabChrome;
		if (indexHistory[result.tabId] > 0){
			--indexHistory[result.tabId];
			desireUrl= historyArray[result.tabId][indexHistory[result.tabId]];
		} else {
			chrome.notifications.create({type: "basic", priority: 1, requireInteraction: true, iconUrl: "images/icon32.png", title: "Información", message: "No hay más páginas para ir hacia atrás en el historial. Puede que el sitio donde busca ir esté en otra pestaña."});
		}
		--indexHistory[result.tabId];
		updateTab(result.tabId, desireUrl);
	}
	if (result.parentFrameId === -1 && !result.transitionQualifiers.includes("forward_back")){ //If it's the main frame and therefore it's a main request	
		if (result.url.indexOf(apiURL) === -1 && result.url.indexOf(extensionMainUrl) === -1) { //If it's not a connection to the API REST and it's not a connection to the extension web pages
			if (localStorage.getItem("url") !== decodeURI(result.url)){ //If the url has not been allowed yet
				//Start to analize the request
				updateTab(result.tabId, waitingPageUrl + "?" + urlCode + "=" + result.url);
				chrome.tabs.get(result.tabId, tab => {
					chrome.storage.local.get(['tkUser'], value => checkToken(value, decodeURI(result.url), tab));
				});	
			} else {
				//Used to store the navigation history to be used when the user go back
				if (!isNaN(indexHistory[result.tabId])) {
					++indexHistory[result.tabId];
				} else {
					indexHistory[result.tabId]= 0;
					historyArray[result.tabId]= [];
				}
				historyArray[result.tabId][indexHistory[result.tabId]]= decodeURI(result.url);
			}
		}		
	}
});

function updateTab(tabId, newUrl){ //Used to control the tabs update without exceptions
	if (!isNaN(tabId) && tabId > -1){
		chrome.tabs.get(tabId, tab => {
			if (tab != null && !isNaN(tab.id) && tab.id > -1){
				chrome.tabs.update(tab.id, {url: newUrl});
			}
		});
	}
}

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => { //Used to remove the goback history
	if (!isNaN(indexHistory[tabId])) {
		indexHistory[tabId]= -1;
		historyArray[tabId]= [];
	}
});

chrome.management.onInstalled.addListener(info => { //When an extension is installed
	//It should notifies the action TODO
	chrome.notifications.create({type: "basic", priority: 2, requireInteraction: true, iconUrl: "images/icon32.png", title: "Acción prohibida", message: "No tienes permisos para instalar extensiones. Tu acción será notificada."});
});

chrome.management.onUninstalled.addListener(id => { //When an extension is uninstalled
	//It should notifies the action TODO
	chrome.notifications.create({type: "basic", priority: 2, requireInteraction: true, iconUrl: "images/icon32.png", title: "Acción prohibida", message: "No tienes permisos para desinstalar extensiones. Tu acción será notificada."});
});

chrome.management.onEnabled.addListener(info => { //When an extension is enabled
	if (info.id !== chrome.runtime.id){ //The own extension can be enabled
		//It should notifies the action TODO
		chrome.notifications.create({type: "basic", priority: 2, requireInteraction: true, iconUrl: "images/icon32.png", title: "Acción prohibida", message: "No tienes permisos para habilitar extensiones. Tu acción será notificada."});
		chrome.management.setEnabled(info.id, false); //It should be disabled again
	}
});

chrome.management.onDisabled.addListener(info => { //When an extension is disabled
	//It should notifies the action TODO
	chrome.notifications.create({type: "basic", priority: 2, requireInteraction: true, iconUrl: "images/icon32.png", title: "Acción prohibida", message: "No tienes permisos para deshabilitar extensiones. Tu acción será notificada."});
});

chrome.bookmarks.onCreated.addListener((id, bookmark) => { //When a bookmark is created it gets deleted
	chrome.notifications.create({type: "basic", priority: 1, requireInteraction: true, iconUrl: "images/icon32.png", title: "Acción no válida", message: "No se permite añadir marcadores."});
	chrome.bookmarks.remove(id);
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
			try{ //Used to avoid problems when a download gets stuck on memory browsers
				chrome.tabs.get(parseInt(tabId), tab => {
					chrome.storage.local.get(['tkUser'], value => checkToken(value, decodeURI(item.url), tab));
				});
			}catch(e){
				chrome.notifications.create({type: "basic", priority: 2, requireInteraction: true, iconUrl: "images/icon32.png", title: "Error", message: "Parece que hay una descarga pendiente que no puede ser procesada. Si no ha solicitado ninguna descarga pruebe a reiniciar el navegador y si el error continúa contacte con el administrador."});
			}
		});				
	} else { //Returns to startpage
		updateTab(parseInt(tabId), newTabChrome);
	}
});

function checkRequestAPI(token, urlDecoded, tab){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", apiURL + apiCheckAccess + "?" + urlCode + "=" + encodeURIComponent(urlDecoded), true);
	xhr.setRequestHeader('uInfo', token);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			try{
				var resp = JSON.parse(xhr.responseText);
				if (resp.access === true && resp.privileges === true){ //If access is granted
					localStorage.setItem("url", urlDecoded);
					updateTab(tab.id, urlDecoded);
				} else if (resp.access === true && resp.privileges === false) { //If access is denied
					localStorage.removeItem("url");
					updateTab(tab.id, bannedPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
				} else if (resp.access === false) { //If token has expired
					localStorage.removeItem("url");
					chrome.notifications.create({type: "basic", priority: 1, requireInteraction: true, iconUrl: "images/icon32.png", title: "Información", message: "Tu inicio de sesión ha expirado, vuelva a iniciar sesión si desea seguir navegando."});
					chrome.storage.local.remove(['tkUser'], () => checkToken(undefined, urlDecoded, tab));
				}
			}catch(e){ //If the API server has an error
				localStorage.removeItem("url");
				if (tab != null){
					updateTab(tab.id, serverErrorPagePageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded));
				}
			}
		}
	}
	xhr.send();
}

chrome.history.onVisited.addListener(result => { //Avoid save history of extension pages
	if (result.url.indexOf(extensionMainUrl) != -1){
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
		updateTab(tab.id, loginPageUrl + "?" + urlCode + "=" + encodeURIComponent(urlDecoded) + "&" + tabCode + "=" + tab.id);
	} else {
		checkRequestAPI(value.tkUser, urlDecoded, tab);
	}
}