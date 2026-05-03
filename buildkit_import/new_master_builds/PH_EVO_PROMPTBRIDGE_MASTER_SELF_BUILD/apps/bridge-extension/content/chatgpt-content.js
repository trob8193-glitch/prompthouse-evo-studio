function getVisibleText() {
  const main = document.querySelector("main");
  const text = main?.innerText || document.body.innerText || "";
  return text.slice(0, 30000);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PH_EVO_GET_VISIBLE_CHAT") {
    sendResponse({ ok: true, title: document.title, url: location.href, text: getVisibleText() });
  }
});
