var bannedPageUrl= chrome.runtime.getURL("/bannedRequest.html");
var loginPageUrl= chrome.runtime.getURL("/loginPage.html");
var extensionMainUrl= "chrome-extension://" + chrome.runtime.id + "/";
var newTabChrome= "chrome://newtab";
var apiCheckAccess= "api/std/checkAccess";
var apiNotifyAction= "api/std/notifyAction";
var headerTkName= "uInfo";
var tOfLocalStorage= "tOf";