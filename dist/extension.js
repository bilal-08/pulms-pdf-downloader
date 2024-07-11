// src/extension.ts
var addRule = function() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: "x-test-request-header",
            operation: HeaderOperation.SET,
            value: "Your-Value-Here"
          }
        ]
      },
      condition: {
        urlFilter: "s3.ap-southeast-1.amazonaws.com/parul-private-cloud-media",
        resourceTypes: [ResourceType.XMLHTTPREQUEST]
      }
    }]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error adding rule:", chrome.runtime.lastError);
    } else {
      console.log("Rule added successfully");
    }
  });
};
var injectContentScript = function(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["./dist/content.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Content script injected successfully");
        resolve();
      }
    });
  });
};
var sendMessageToContentScript = function(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, function(response) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        resolve(false);
      } else {
        console.log("Message sent successfully, response:", response);
        resolve(true);
      }
    });
  });
};
console.log("Background script loaded");
var { RuleActionType, HeaderOperation, ResourceType } = chrome.declarativeNetRequest;
chrome.runtime.onInstalled.addListener(addRule);
console.log("Background script loaded");
chrome.webRequest.onBeforeRequest.addListener(async (details) => {
  if (details.url.includes("s3.ap-southeast-1.amazonaws.com/parul-private-cloud-media")) {
    console.log("Request intercepted:", details.url);
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      try {
        await injectContentScript(tabs[0].id);
        const messageSent = await sendMessageToContentScript(tabs[0].id, { action: "addDownloadButton", url: details.url });
        if (messageSent) {
          console.log("Message sent to content script");
        } else {
          console.log("Failed to send message to content script");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }
}, { urls: ["*://*.amazonaws.com/*"] });
