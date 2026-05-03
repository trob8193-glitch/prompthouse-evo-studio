const capture = document.querySelector('#capture');
let current = null;

async function render() {
  const result = await chrome.storage.local.get(['lastPromptHouseCapture']);
  current = result.lastPromptHouseCapture || null;
  capture.textContent = current ? JSON.stringify(current, null, 2) : 'No capture yet.';
}

document.querySelector('#copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(current ? JSON.stringify(current, null, 2) : '');
});

chrome.storage.onChanged.addListener(render);
render();