var urlString= window.location.href;
var urlSearch= new URL(urlString);
var url= decodeURIComponent(urlSearch.searchParams.get("url_"));
document.querySelector('#urlPlace').innerHTML+= url;