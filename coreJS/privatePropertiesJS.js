var apiURL= "https://ec2-54-85-152-173.compute-1.amazonaws.com:6993/";
//var apiURL= "http://localhost:7991/";
var apiLoginUrl= "api/login";
var apiSlotsTodayUrl= "api/slotsToday";
var actionCode= "action_";
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
var apiNotifyAction= "api/notification";
var headerTkName= "uInfo";
var tOfLocalStorage= "tOf";
var hashLocalStorage= "hshStorage";
var programmedTimeoutFunctions= [];
var programmedIntervalFunctions= [];
var chromeStartPage= "chrome-search://local-ntp/local-ntp.html";
var userIdLocalStorage= "userId";
var numberOfStoreAttemps= 3;
var tofNotificationsLocalStorage= "tofNotificationsLocalStorage";
var initialTimeStorage= "initialTimeStorage";
var timeDifferencesStorage= "timeDifferencesStorage";
var currentSlotIdStorage= "currentSlotIdStorage";
var actHsStorage= "actHsStorage";
var actTimStorage= "actTimStorage";
var actBolStorage= "actBolStorage";
var timeOfCheckActivation= 300000;
var timeOfCheckAlive= 600000;