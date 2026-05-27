# PromptHouse Evo Studio — Component Installation Guide

Welcome to **PromptHouse Evo Studio**. This Install Pack contains the external clients (Browser Extension & Desktop App) that connect directly to your local Autonomous Studio.

## 1. How to Install the Chrome/Brave Browser Extension

The Evo Studio Browser Extension allows you to autonomously scrape data, test websites visually, and connect the Studio's daemons to your active web session.

**Step-by-Step Instructions:**
1. Open Google Chrome, Brave, or any Chromium-based browser.
2. In the URL bar, type: `chrome://extensions/` and hit Enter.
3. In the top-right corner, toggle **Developer mode** to ON.
4. In the top-left corner, click the **Load unpacked** button.
5. A file browser will appear. Navigate to this exact `Evo_Studio_Install_Pack` folder and select the `Browser_Extension` folder.
6. The extension is now installed! You will see the Evo Studio icon in your browser toolbar.

**Connection Check:** 
As long as your Studio is running (via `launcher.bat` or `launcher.sh`), the extension will automatically connect to `http://localhost:3001` and sync with your Daemons.

---

## 2. How to Launch the Desktop App (Electron)

If you have built the native Electron Desktop app, it will be located in the `Desktop_App` folder.

**Step-by-Step Instructions:**
1. Open the `Desktop_App` folder in this Install Pack.
2. If you see a `.exe` (Windows) or `.dmg` / `.app` (Mac), simply double-click it to install and launch the native desktop experience.
3. If the folder only contains source files (`main.js`, etc.), you must compile it via the Studio Terminal by running: `npm run build:desktop` (if configured in your `package.json`).

---

## 3. Having Trouble?

If the Extension or Desktop App says "Disconnected":
1. Make sure you have run the `launcher.bat` or `./launcher.sh` script in the main repository.
2. Check your Studio's "Top Bar" to ensure the API Bridge is running and displays a green `Bridge Online` badge.
3. Ensure you have an active Enterprise License in your `.env` file if you are trying to use advanced Autonomous Sandbox features.
