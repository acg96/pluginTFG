document.querySelector('#buttonID').onclick= login;
var apiURL= "http://ec2-54-149-155-245.us-west-2.compute.amazonaws.com:7991";

function login(){
	var username= document.querySelector('#usernameID').value.trim().toUpperCase();
	var passw= document.querySelector('#passwordID').value.trim();
	if (username !== "" && passw !== ""){
		var xhr = new XMLHttpRequest();
		xhr.open("POST", apiURL + "/login", true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				try{
					var resp = JSON.parse(xhr.responseText);
					if (resp.access === true) {
						var urlString= window.location.href;
						var urlSearch= new URL(urlString);
						var url= decodeURIComponent(urlSearch.searchParams.get("url_"));
						var tabId= urlSearch.searchParams.get("tb_");
						chrome.storage.local.set({'tkUser': resp.token}, () => {
							chrome.tabs.update(parseInt(tabId), {url: url});
						});					
					} else {
						document.querySelector('#errorLogIn').innerHTML= "Los datos introducidos no coinciden con ningún registro";
					}
				}catch(e){
					document.querySelector('#errorLogIn').innerHTML= "El servidor no responde correctamente";
				}					
			}
		}
		xhr.send('password=' + passw + '&username=' + username);
		
	} else {
		document.querySelector('#errorLogIn').innerHTML= "No se puede dejar ningún campo en blanco";
	}
}