function manageMessage(){
	chrome.runtime.sendMessage({}, response => {
		if (response != null && response.result != null){
			if (response.result === messageKey_noToF){
				document.querySelector('#actionNotify').removeAttribute("hidden");
			} else if (response.result === messageKey_onToF){
				document.querySelector('#tOfNotify').removeAttribute("hidden");
			}
		}
	});
}

manageMessage();