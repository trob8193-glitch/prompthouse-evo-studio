# PH Evo Bridge Browser Extension

This is a loadable Chrome/Chromium extension, no build step required.

## Load

1. Run local gateway first: `cd apps/local-gateway && npm install && npm run dev`
2. Open Chrome: `chrome://extensions`
3. Turn on Developer Mode
4. Click Load Unpacked
5. Select `apps/bridge-extension`
6. Open ChatGPT page
7. Click the PH Evo Bridge extension icon to open the side panel
8. Press **Capture Current Chat**

## Truth boundary

The extension captures visible page text only when the user clicks capture. It does not silently scrape pages. Training capture defaults off.
