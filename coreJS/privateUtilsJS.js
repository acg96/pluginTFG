//Used to know the main domain without matter the subdomain and the protocol
function getMainDomain(href) {
	var mainDomain= null;
	try{
		var url = new URL(href);
		var urlSplit= url.hostname.split(".");
		mainDomain= urlSplit[urlSplit.length - 2] + "." + urlSplit[urlSplit.length - 1];
	}catch(e){}
    return mainDomain;
};

//Used to notify actions to API
//action -> A string code to classify the action
//moreData -> Used to provide more data using a string
function notifyAction(action, moreData){
	chrome.storage.local.get([tkLocalStorage], value => {
		makeRequest("POST", 
				apiURL + apiNotifyAction, 
				actionCode + "=" + action + "&" + moreInfoCode + "=" + encodeURI(moreData),
				[{name: headerTkName, value: value[tkLocalStorage]}, {name: 'Content-type', value: 'application/x-www-form-urlencoded'}],
				xhr => {
					var resp = JSON.parse(xhr.responseText);
					if (resp.access === false) { //If token has expired
						showTrayNotification(1, "Información", "Tu inicio de sesión ha expirado, vuelva a iniciar sesión si desea seguir navegando.");
						chrome.storage.local.remove([tkLocalStorage]);
					}
				},
				() => {
				}
		);
	});
}



