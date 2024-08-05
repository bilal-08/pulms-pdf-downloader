# pulms-pdf-maker

A simple extension that binds a download button to the currently viewing document on the pulms site, which doesn't provide any download button.

# 📝 PPTX/PPT Downloading
On the platforms, PPTX/PPT files are presented as images, and direct downloading or converting them to PDFs is restricted due to CORS (Cross-Origin Resource Sharing) policies.  This repository provides a solution to circumvent this limitation by enabling users to copy the image links and then create PDFs on their own end.
## Firefox

You can get it from [here](https://addons.mozilla.org/en-US/firefox/addon/pulms-pdf-downloader).

## Chrome

1. Clone the repo.
2. Go to `chrome://extensions/`.
3. Enable Developer mode.
4. Click on "Load unpacked" and select the folder where the `manifest.json` is located.

## Development

### Install Dependencies

```bash
bun install
```

### To Run

```bash
bun run build
```

Then refresh/reload the extension.

---