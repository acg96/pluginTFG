document.querySelector('#buttonCloseID').onclick= logout;
window.onload= checkToken;

function checkToken(){
	chrome.storage.local.get([tkLocalStorage], value => {
		if (typeof value[tkLocalStorage] === "undefined"){ //If there is no token, the actionPage button gets disabled
			document.querySelector('#buttonCloseID').setAttribute("hidden", "hidden");
		} else {
			document.querySelector('#buttonCloseID').removeAttribute("hidden");
		}
	});
}

function logout(){
	onSessionClosed();
	window.close();
}