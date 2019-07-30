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
	window.close();
}