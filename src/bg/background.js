// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.tabs.onUpdated.addListener(function() {
  chrome.tabs.executeScript(null, { file: "src/inject/jquery-2.1.1.min.js" }, function() {
    chrome.tabs.executeScript(null, { file: "js/jquery.tooltipster.min.js" });
    chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
  });   
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if(request.method == "getLocalStorage"){
		sendResponse({"keys": localStorage.getItem("keys")});
	}
	else if(request.method == "setLocalStorage"){
		localStorage.setItem("keys", request.data);
	}
	else if(request.method == "setPreviousLocalStorage"){
		localStorage.setItem("previouskeys", request.data);
	}
	else if(request.method == "getPreviousLocalStorage"){
		sendResponse({"previouskeys": localStorage.getItem("previouskeys")});
	}
	else
		sendResponse({});
});