/**
 * PromptHouse Evo Studio — Chrome Extension Content Script
 * Owner: Cipher Lynx | Truth State: built
 * 
 * Injected into all pages. Watches for selection and keyboard shortcuts.
 * User action required before any capture — no silent telemetry.
 */

const PH_SHORTCUT = 'p'; // Ctrl+Shift+P to capture selection

// ─── Selection Capture via Keyboard Shortcut ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === PH_SHORTCUT) {
    const selectedText = window.getSelection()?.toString()?.trim();
    if (!selectedText) return;

    // Confirm user intent before capture (NO-BULLSHIT LAW: user action required)
    if (!window.confirm(`Capture this selection to PromptHouse Studio?\n\n"${selectedText.slice(0, 100)}..."`)) return;

    chrome.runtime.sendMessage({
      type: 'CAPTURE_SELECTION',
      payload: {
        selectedText,
        sourceUrl: window.location.href,
        pageTitle: document.title,
        captureType: 'selection',
        userActionRequired: true,
        timestamp: new Date().toISOString(),
      },
    }, (response) => {
      if (response?.success) {
        showToast('✅ Captured to PromptHouse Studio!');
      } else {
        showToast('⚠️ Bridge offline. Queued for retry.');
      }
    });
  }
});

// ─── Toast Notification ───────────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.getElementById('ph-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ph-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#1e1e2e',
    color: '#f5c842',
    border: '1px solid #f5c842',
    borderRadius: '10px',
    padding: '12px 20px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    zIndex: '999999',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    transition: 'opacity 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

console.log('[PH Evo Bridge] Content script loaded. Ctrl+Shift+P to capture selection.');
