var urlString= window.location.href;
var urlSearch= new URL(urlString);
var url= decodeURIComponent(urlSearch.searchParams.get(urlCode));
document.querySelector('#urlPlace').innerHTML+= url;