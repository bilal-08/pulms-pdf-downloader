console.log("Content script loaded");
let downloadButton: any = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in content script:", request);
    if (request.action === "addDownloadButton") {
        console.log("Adding download button");
        if (!downloadButton) {
            if(Array.isArray(request.urls)){
                console.log(request.urls)
                addButtonToPagePDF(request.urls)
            }
            else {
                addButtonToPage(request.urls);
                sendResponse({status: "Button added"});
            }
        } else {
            console.log("Download button already added.");
            sendResponse({status: "Button already added"});
        }
    }
    return true;
});

function addButtonToPagePDF(urls:string[]){
    console.log(urls)
    console.log("Adding button to page");
    const button = document.createElement('div');
    button.id = 'dwnldbtn';
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
        cursor: pointer;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s, transform 0.2s;
    `;

    const link = document.createElement('a');
    link.textContent = 'Copy Links';
    link.style.cssText = `
        color: inherit;
        text-decoration: none;
    `;
    link.setAttribute('download', 'download.pdf');
    link.addEventListener('click', (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(JSON.stringify(urls))
        link.textContent = 'Links Copied!';
    });


    button.appendChild(link);

    document.body.appendChild(button);
    downloadButton = button;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const removedNodes = mutation.removedNodes;
                for (let node of Array.from(removedNodes)) {
                    if ((node instanceof Element) && Array.from(node.classList).some((cls) => cls.startsWith('ng-tns-c117'))) {
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
}




function addButtonToPage(url: string) {
    console.log(url);
    console.log("Adding button to page");

    const button = document.createElement('div');
    button.id = 'dwnldbtn';
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
        cursor: pointer;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s, transform 0.2s;
        display: inline-block; /* Ensure the div takes up only necessary space */
        width: auto; /* Auto width for flexibility */
        height: auto; /* Auto height for flexibility */
        line-height: 1.5; /* Ensure text alignment */
    `;

    const link = document.createElement('a');
    link.textContent = 'Download PDF';
    link.style.cssText = `
        color: inherit;
        text-decoration: none;
        display: block; /* Make sure link takes up the full area of the div */
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        padding: 0; /* Remove additional padding from link */
    `;
    link.setAttribute('download', 'download.pdf');
    link.href = url;

    button.addEventListener('click', (event) => {
        event.preventDefault();
        downloadFile(url);
    });

    button.appendChild(link);
    document.body.appendChild(button);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const removedNodes = mutation.removedNodes;
                for (let node of Array.from(removedNodes)) {
                    if ((node instanceof Element) && Array.from(node.classList).some((cls) => cls.startsWith('ng-tns-c117'))) {
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
}


function removeDownloadButton() {
    const buttonToRemove = document.getElementById('dwnldbtn');
    if (buttonToRemove && buttonToRemove.parentNode) {
        buttonToRemove.parentNode.removeChild(buttonToRemove);
        downloadButton = null;
    }
}

function downloadFile(url: string) {
    console.log("Downloading file:", url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if (xhr.status === 200) {
            const a = document.createElement('a');
            a.style.display = 'none';
            const blob = new Blob([xhr.response], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            a.href = blobUrl;
            a.download = decodeURI(url.split("https://s3.ap-southeast-1.amazonaws.com/parul-private-cloud-media/")[1]);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            removeDownloadButton(); // Remove the button after the download
        } else {
            console.error('Failed to download file. Status:', xhr.status);
        }
    };
    xhr.onerror = function() {
        console.error('Network error occurred while downloading file.');
    };
    xhr.send();
}
