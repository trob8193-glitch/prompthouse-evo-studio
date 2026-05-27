document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const logOutput = document.getElementById('logOutput');

  let isActive = false;

  // Init state
  chrome.storage.local.get(['autonomousMode'], (result) => {
    isActive = !!result.autonomousMode;
    updateUI();
  });

  toggleBtn.addEventListener('click', () => {
    isActive = !isActive;
    
    // Send to background
    chrome.runtime.sendMessage({ action: 'SET_AUTONOMOUS_MODE', value: isActive }, (response) => {
      if (response && response.success) {
        updateUI();
        logOutput.innerHTML += `<div>[CMD] Auto-Scan ${isActive ? 'ENGAGED' : 'DISENGAGED'}</div>`;
        logOutput.scrollTop = logOutput.scrollHeight;
      }
    });
  });

  function updateUI() {
    if (isActive) {
      statusIndicator.classList.add('active');
      statusText.innerText = 'Autonomous Mode: ACTIVE';
      toggleBtn.classList.add('active');
      toggleBtn.innerText = 'Disengage';
    } else {
      statusIndicator.classList.remove('active');
      statusText.innerText = 'Autonomous Mode: OFF';
      toggleBtn.classList.remove('active');
      toggleBtn.innerText = 'Engage Autonomous Scan';
    }
  }
});
