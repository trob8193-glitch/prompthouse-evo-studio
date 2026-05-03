function getVisibleText() {
  const main = document.querySelector("main");
  return (main?.innerText || document.body.innerText || "").slice(0, 20000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PH_EVO_GET_VISIBLE_TEXT") {
    sendResponse({ ok: true, title: document.title, url: location.href, text: getVisibleText() });
  }
});
