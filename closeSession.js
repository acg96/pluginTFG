document.querySelector('#buttonCloseID').onclick= logout;
window.onload= checkToken;

function checkToken(){
	var jsonData= {"type": messageKey_checkTk};
	chrome.runtime.sendMessage(jsonData, response => {
		if (response != null && response.result != null){
			if (response.result === messageKey_connected){
				document.querySelector('#buttonCloseID').removeAttribute("hidden");
			} else if (response.result === messageKey_disconnected){
				document.querySelector('#buttonCloseID').setAttribute("hidden", "hidden");
			} else if (response.result === messageKey_onToF){
				document.querySelector('#buttonCloseID').removeAttribute("hidden");
				document.querySelector('#buttonCloseID').innerHTML= "Quitar modo vuelo";
			}
		} else {
			document.querySelector('#buttonCloseID').setAttribute("hidden", "hidden");
		}
	});
}

function logout(){
	var jsonData= {"type": messageKey_closeSession};
	chrome.runtime.sendMessage(jsonData, response => {
		window.close();
	});	
}