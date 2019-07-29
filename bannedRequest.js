var urlString= window.location.href;
var url= new URL(urlString);
var valueParam= url.searchParams.get("url_");
document.querySelector('#urlPlace').innerHTML+= valueParam;