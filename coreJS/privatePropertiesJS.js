var apiURL= "http://ec2-54-149-155-245.us-west-2.compute.amazonaws.com:7991/";
var apiLoginUrl= "login";
var actionCode= "action_";
var moreInfoCode= "moreInfo_";
var tabCode= "tb_";
var tkLocalStorage= "tkUser";
var activatedToFLocalStorage= "isToF";
var cacheLocalStorage= "cacheUrls";
var whiteListCheckLocalStorage= "whiteListCheck";
var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/loginPage.html");
var closeSessionPageUrl= chrome.runtime.getURL("/closeSessionPopUp.html");
var extensionMainUrl= "chrome-extension://" + chrome.runtime.id + "/";
var newTabChrome= "chrome://newtab";
var apiCheckAccess= "api/std/checkAccess";
var apiNotifyAction= "api/std/notifyAction";
var headerTkName= "uInfo";
var tOfLocalStorage= "tOf";