document.querySelector('#buttonID').onclick= login;

document.getElementById("usernameID").autofocus= true; 

document.querySelector("#passwordID").addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    document.querySelector("#buttonID").click();
    event.preventDefault();
});

document.querySelector("#usernameID").addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    document.querySelector("#buttonID").click();
    event.preventDefault();
});

$(function () {
  $('[data-toggle="popover"]').popover()
})
$('.popover-dismiss').popover({
  trigger: 'focus'
})

function login(){
	var username= document.querySelector('#usernameID').value.trim().toUpperCase();
	var passw= document.querySelector('#passwordID').value.trim();
	if (username !== "" && passw !== ""){
		makeRequest("POST", 
				apiURL + apiLoginUrl,
				'password=' + passw + '&username=' + username,
				[{name: 'Content-type', value: 'application/x-www-form-urlencoded'}],
				xhr => {
					var resp = JSON.parse(xhr.responseText);
					if (resp.access === true) {
						var urlString= window.location.href;
						var urlSearch= new URL(urlString);
						var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
						var tabId= urlSearch.searchParams.get(tabCode);
						var keyStorage= {};
						keyStorage[tkLocalStorage]= resp.token;
						chrome.storage.local.set(keyStorage, () => {
							updateTab(parseInt(tabId), url);
						});					
					} else {
						document.querySelector('#errorLogIn').innerHTML= "Los datos introducidos no coinciden con ningún registro";
						document.querySelector('#errorLogIn').removeAttribute("hidden");
					}
				},
				() => {
					document.querySelector('#errorLogIn').innerHTML= "El servidor no responde correctamente, solo podrá acceder a las páginas por defecto.";
					document.querySelector('#errorLogIn').removeAttribute("hidden");
					enableToF(() => {
						var urlString= window.location.href;
						var urlSearch= new URL(urlString);
						var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
						var tabId= urlSearch.searchParams.get(tabCode);
						updateTab(parseInt(tabId), url);
					});
				}
		);		
	} else {
		document.querySelector('#errorLogIn').innerHTML= "No se puede dejar ningún campo en blanco";
		document.querySelector('#errorLogIn').removeAttribute("hidden");
	}
}