const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const scanBtn = document.getElementById('btn-scan');
const captureBtn = document.getElementById('btn-capture');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Ensure communication with the Bridge via Background worker
async function sendMessageToBridge(text) {
  addMessage(text, 'user');
  input.value = '';

  chrome.runtime.sendMessage({
    type: 'CHAT',
    messages: [{ role: 'user', content: text }],
    systemPrompt: "You are a Meta-Autonomous Browser Agent. You can guide the user or generate actions."
  }, (response) => {
    if (response?.success) {
      addMessage(response.message, 'evo');
      
      // Auto-detect JSON actions in the response
      if (response.message.includes('{"action"')) {
        try {
          const jsonMatch = response.message.match(/\{"action".*\}/);
          if (jsonMatch) {
            const actionPayload = JSON.parse(jsonMatch[0]);
            executeActionOnTab(actionPayload);
          }
        } catch(e) { console.error('Failed to parse action', e); }
      }
    } else {
      addMessage('⚠️ Connection to Bridge failed. Operating offline.', 'evo');
    }
  });
}

function executeActionOnTab(payload) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_ACTION', payload }, (res) => {
      if (res?.success) {
        addMessage(`✅ Executed: ${payload.action} on ${payload.targetId}`, 'evo');
      } else {
        addMessage(`❌ Failed to execute action: ${res?.error}`, 'evo');
      }
    });
  });
}

sendBtn.addEventListener('click', () => {
  if (input.value.trim()) sendMessageToBridge(input.value.trim());
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && input.value.trim()) sendMessageToBridge(input.value.trim());
});

scanBtn.addEventListener('click', () => {
  addMessage('Scanning active page for interactive Meta Nodes...', 'evo');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_DOM' }, (res) => {
      if (res?.success) {
        addMessage(`Scan complete. Found ${res.elements.length} interactive nodes. Forwarding to Studio Context.`, 'evo');
      }
    });
  });
});

captureBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: () => window.getSelection().toString()
    }).then(results => {
      const text = results[0].result;
      if (text) {
        sendMessageToBridge(`Analyze this captured text from the page:\n\n${text}`);
      } else {
        addMessage('Please highlight some text on the page first.', 'evo');
      }
    });
  });
});
