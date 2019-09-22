function manageMessage(){
	isOnToF(result => {
		if (result){
			document.querySelector('#tOfNotify').removeAttribute("hidden");
		} else{
			document.querySelector('#actionNotify').removeAttribute("hidden");
		}
	});
}

manageMessage();