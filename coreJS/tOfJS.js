chrome.runtime.onInstalled.addListener(details => {
	var tOf= ["uniovi.es"];
	var keyArray= {};
	keyArray[tOfLocalStorage]= tOf;
	chrome.storage.local.set(keyArray, () => {});
});

