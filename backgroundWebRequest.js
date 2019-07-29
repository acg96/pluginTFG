chrome.runtime.onInstalled.addListener(function() {
    chrome.webRequest.onBeforeRequest.addListener(
        function(result){
            var url = result.url;
            //AJAX request to ensure the user has privileges
            let notAllow = url.indexOf("google") != -1; //now block all the urls which contain google
            var response = {};
            if (notAllow) {
                let initiator = result.initiator; //undefined if the user request it, otherwise it'll have the url which requested it
                let timestamp = result.timeStamp; //request time (ms)
                response = {redirectUrl: "chrome-extension://pnhepmckfbdbllddbmfobfeccpkkcgpg/bannedRequest.html?url_=" +url};
            }
            return response;
        }, {urls: ["*://*/*"]}, ["blocking"]);
  });