// src/content.ts
var addButtonToPage = function(url) {
  console.log("Adding button to page");
  const button = document.createElement("a");
  button.textContent = "Download PDF";
  button.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 9999;
        padding: 12px 24px;
        background-color: #007bff;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-family: 'Roboto', sans-serif;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s, transform 0.2s;
    `;
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#0056b3";
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#007bff";
  });
  button.addEventListener("click", (event) => {
    event.preventDefault();
    downloadFile(url);
  });
  button.setAttribute("download", "download.pdf");
  button.setAttribute("id", "pulmsd");
  button.href = url;
  document.body.appendChild(button);
  downloadButton = button;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const removedNodes = mutation.removedNodes;
        for (let node of Array.from(removedNodes)) {
          if (node instanceof Element && Array.from(node.classList).some((cls) => cls.startsWith("ng-tns-c117"))) {
            console.log("Modal removed, removing download button");
            removeDownloadButton();
            observer.disconnect();
            break;
          }
        }
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
};
var removeDownloadButton = function() {
  if (downloadButton && downloadButton.parentNode) {
    downloadButton.parentNode.removeChild(downloadButton);
    downloadButton = null;
  }
};
var downloadFile = function(url) {
  console.log("Downloading file:", url);
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function() {
    if (xhr.status === 200) {
      const a = document.createElement("a");
      a.style.display = "none";
      const blob = new Blob([xhr.response], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
      a.download = decodeURI(url.split("https://s3.ap-southeast-1.amazonaws.com/parul-private-cloud-media/")[1]);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } else {
      console.error("Failed to download file. Status:", xhr.status);
    }
  };
  xhr.onerror = function() {
    console.error("Network error occurred while downloading file.");
  };
  xhr.send();
};
console.log("Content script loaded");
var downloadButton = null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message received in content script:", request);
  if (request.action === "addDownloadButton") {
    console.log("Adding download button");
    if (!downloadButton) {
      addButtonToPage(request.url);
      sendResponse({ status: "Button added" });
    } else {
      console.log("Download button already added.");
      sendResponse({ status: "Button already added" });
    }
  }
  return true;
});
