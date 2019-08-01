document.querySelector('#buttonCloseID').onclick= logout;
window.onload= checkToken;

function checkToken(){
	chrome.storage.local.get(['tkUser'], value => {
		if (typeof value.tkUser === "undefined"){ //If there is no token, the actionPage button gets disabled
			document.querySelector('#buttonCloseID').setAttribute("disabled", "disabled");
		} else {
			document.querySelector('#buttonCloseID').removeAttribute("disabled");
		}
	});
}

function logout(){
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
	window.close();
}