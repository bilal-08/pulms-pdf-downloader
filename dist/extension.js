// src/extension.ts
function addRule() {
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
}
function injectContentScript(tabId) {
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
}
function sendMessageToContentScript(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        resolve(false);
      } else {
        console.log("Message sent successfully, response:", response);
        resolve(true);
      }
    });
  });
}
function debounceSendMessage(tabId) {
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(async () => {
    try {
      await injectContentScript(tabId);
      const messageSent = await sendMessageToContentScript(tabId, { action: "addDownloadButton", urls: interceptedUrls });
      if (messageSent) {
        console.log("Message sent to content script");
        interceptedUrls = [];
      } else {
        console.log("Failed to send message to content script");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, 500);
}
console.log("Background script loaded");
var { RuleActionType, HeaderOperation, ResourceType } = chrome.declarativeNetRequest;
chrome.runtime.onInstalled.addListener(addRule);
console.log("Background script loaded");
var interceptedUrls = [];
var debounceTimeout = null;
chrome.webRequest.onBeforeRequest.addListener(async (details) => {
  const url = details.url;
  console.log("Request intercepted:", url);
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    if (url.includes(".pdf")) {
      try {
        await injectContentScript(tabs[0].id);
        const messageSent = await sendMessageToContentScript(tabs[0].id, { action: "addDownloadButton", urls: url });
        if (messageSent) {
          console.log("Message sent to content script for PDF URL");
        } else {
          console.log("Failed to send message to content script for PDF URL");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      interceptedUrls.push(url);
      debounceSendMessage(tabs[0].id);
    }
  }
}, { urls: ["*://*.amazonaws.com/*"] });
