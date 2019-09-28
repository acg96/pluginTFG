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
		var jsonData= {"username": username, "passw": passw, "urlString": window.location.href};
		chrome.runtime.sendMessage(jsonData, response => {
			if (response != null && response.result != null){
				if (response.result === messageKey_incorrect){
					document.querySelector('#errorLogIn').innerHTML= "Los datos introducidos no coinciden con ningún registro";
					document.querySelector('#errorLogIn').removeAttribute("hidden");
				} else if (response.result === messageKey_serverError){
					document.querySelector('#errorLogIn').innerHTML= "El servidor no responde correctamente, solo podrá acceder a las páginas por defecto.";
					document.querySelector('#errorLogIn').removeAttribute("hidden");
				}
			} else {
				document.querySelector('#errorLogIn').innerHTML= "Ha ocurrido un problema, inténtalo de nuevo.";
				document.querySelector('#errorLogIn').removeAttribute("hidden");
			}
		});
	} else {
		document.querySelector('#errorLogIn').innerHTML= "No se puede dejar ningún campo en blanco";
		document.querySelector('#errorLogIn').removeAttribute("hidden");
	}
}