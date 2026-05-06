/**
 * EVO BRIDGE — CONTENT SCRIPT v3.0
 * ═══════════════════════════════════════════════════════════════
 * Runs on every page. The "nervous system" with full capabilities:
 * - DOM Stealer with live mutation observer
 * - Bug Sniper overlay
 * - Prompt Injector 
 * - Sentient Chat overlay (Ctrl+Shift+K)
 * - Reality Twin watcher
 * - Visual toast notifications
 * - Upgrade-Ready glow on page
 * - Auto-error capture to bridge
 * - Self-evolution seed on every session
 */

(function() {
  if (window.__EVO_BRIDGE_LOADED__) return;
  window.__EVO_BRIDGE_LOADED__ = true;

  const BRIDGE = 'http://localhost:3001';
  let bridgeOnline = false;
  let sentientChatOpen = false;
  window.__evoErrors = [];

  // ─── TOAST NOTIFICATION SYSTEM ─────────────────────────────────
  function showToast(msg, color = '#10b981') {
    const existing = document.getElementById('evo-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'evo-toast';
    toast.style.cssText = `
      position:fixed;top:20px;right:20px;z-index:2147483647;
      background:#000;border:1px solid ${color};color:${color};
      padding:12px 20px;border-radius:12px;font-family:monospace;
      font-size:12px;font-weight:900;letter-spacing:1px;
      box-shadow:0 0 20px ${color}40;animation:evoFadeIn 0.3s ease;
      max-width:350px;line-height:1.4;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', 3000);
    setTimeout(() => toast.remove(), 3500);
  }

  // ─── UPGRADE GLOW ON PAGE ──────────────────────────────────────
  function applyUpgradeGlow(active) {
    let glow = document.getElementById('evo-upgrade-glow');
    if (active && !glow) {
      glow = document.createElement('div');
      glow.id = 'evo-upgrade-glow';
      glow.style.cssText = `
        position:fixed;inset:0;z-index:2147483640;pointer-events:none;
        border:3px solid #6366f1;animation:evoBorderPulse 2s ease-in-out infinite;
      `;
      document.body.appendChild(glow);
      const style = document.createElement('style');
      style.textContent = `
        @keyframes evoBorderPulse {
          0%{box-shadow:inset 0 0 20px rgba(99,102,241,0.1),0 0 20px rgba(99,102,241,0.1);}
          50%{box-shadow:inset 0 0 60px rgba(99,102,241,0.4),0 0 60px rgba(99,102,241,0.4);}
          100%{box-shadow:inset 0 0 20px rgba(99,102,241,0.1),0 0 20px rgba(99,102,241,0.1);}
        }
        @keyframes evoFadeIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `;
      document.head.appendChild(style);
    } else if (!active && glow) {
      glow.remove();
    }
  }

  // ─── DOM STEALER: Live Mutation Observer ───────────────────────
  const domObserver = new MutationObserver((mutations) => {
    const changes = mutations.slice(0, 10).map(m => ({
      type: m.type, target: m.target?.tagName, added: m.addedNodes?.length, removed: m.removedNodes?.length
    }));
    chrome.storage.local.set({ lastDomChange: { changes, url: location.href, ts: Date.now() } });
  });
  domObserver.observe(document.body, { childList: true, subtree: true, attributes: false });

  // ─── AUTO ERROR CAPTURE ────────────────────────────────────────
  window.addEventListener('error', (e) => {
    const err = { message: e.message, filename: e.filename, lineno: e.lineno, ts: Date.now() };
    window.__evoErrors.push(err);
    if (window.__evoErrors.length > 20) window.__evoErrors.shift();
    // Send to bridge if online
    if (bridgeOnline) {
      fetch(`${BRIDGE}/api/repair`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: JSON.stringify(err), url: location.href, source: 'auto-error-capture' })
      }).catch(() => {});
    }
  });

  // ─── SENTIENT CHAT OVERLAY ─────────────────────────────────────
  function openSentientChat() {
    if (sentientChatOpen) return;
    sentientChatOpen = true;

    const overlay = document.createElement('div');
    overlay.id = 'evo-sentient-chat';
    overlay.style.cssText = `
      position:fixed;bottom:20px;right:20px;z-index:2147483646;
      width:380px;height:520px;background:#000;
      border:1px solid #6366f1;border-radius:20px;
      display:flex;flex-direction:column;overflow:hidden;
      box-shadow:0 0 40px rgba(99,102,241,0.4);
      font-family:monospace;
    `;

    overlay.innerHTML = `
      <div style="background:#0a0a0a;border-bottom:1px solid #1a1a2e;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11px;font-weight:900;color:#6366f1;letter-spacing:2px;">SENTIENT CHAT</div>
          <div style="font-size:8px;color:#475569;letter-spacing:1px;">POWERED BY EVO STUDIO + OPENAI</div>
        </div>
        <button id="evo-chat-close" style="background:none;border:none;color:#475569;cursor:pointer;font-size:18px;line-height:1;">×</button>
      </div>
      <div id="evo-chat-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#000;"></div>
      <div style="padding:12px;border-top:1px solid #1a1a2e;display:flex;gap:8px;">
        <input id="evo-chat-input" placeholder="Ask the Sovereign Brain..." style="
          flex:1;background:#0a0a0a;border:1px solid #1a1a2e;border-radius:10px;
          padding:10px 14px;color:#fff;font-size:11px;font-family:monospace;outline:none;
        " />
        <button id="evo-chat-send" style="
          background:#6366f1;border:none;border-radius:10px;padding:10px 16px;
          color:#fff;font-size:10px;font-weight:900;cursor:pointer;letter-spacing:1px;
        ">SEND</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close button
    document.getElementById('evo-chat-close').onclick = () => {
      overlay.remove(); sentientChatOpen = false;
    };

    // Send message
    async function sendMessage() {
      const input = document.getElementById('evo-chat-input');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';

      const messages = document.getElementById('evo-chat-messages');
      const userBubble = document.createElement('div');
      userBubble.style.cssText = 'background:#1a1a2e;border-radius:10px;padding:10px 14px;font-size:11px;color:#fff;align-self:flex-end;max-width:80%;';
      userBubble.textContent = msg;
      messages.appendChild(userBubble);
      messages.scrollTop = messages.scrollHeight;

      const thinking = document.createElement('div');
      thinking.style.cssText = 'background:#0a0a0a;border:1px solid #1a1a2e;border-radius:10px;padding:10px 14px;font-size:11px;color:#6366f1;';
      thinking.textContent = '...thinking';
      messages.appendChild(thinking);

      try {
        const pageCtx = document.body?.innerText?.slice(0, 3000);
        const res = await fetch(`${BRIDGE}/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, context: `Page: ${location.href}\n${pageCtx}`, mode: 'sentient-chat' })
        });
        const data = await res.json();
        thinking.style.color = '#10b981';
        thinking.textContent = data.reply || data.message || 'No response.';
      } catch (e) {
        thinking.style.color = '#ef4444';
        thinking.textContent = 'Bridge offline. Check localhost:3001.';
      }
      messages.scrollTop = messages.scrollHeight;
    }

    document.getElementById('evo-chat-send').onclick = sendMessage;
    document.getElementById('evo-chat-input').onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };
  }

  // ─── BUG SNIPER OVERLAY ────────────────────────────────────────
  function runBugSniper(result) {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position:fixed;top:20px;left:20px;z-index:2147483646;
      width:340px;background:#000;border:1px solid #f59e0b;border-radius:16px;
      padding:16px;font-family:monospace;font-size:10px;color:#f59e0b;
      box-shadow:0 0 30px rgba(245,158,11,0.3);
    `;
    panel.innerHTML = `
      <div style="font-weight:900;font-size:12px;letter-spacing:2px;margin-bottom:12px;">🎯 BUG SNIPER REPORT</div>
      <pre style="white-space:pre-wrap;color:#fbbf24;">${JSON.stringify(result, null, 2)}</pre>
      <button onclick="this.parentNode.remove()" style="margin-top:12px;background:#f59e0b;border:none;color:#000;padding:8px 16px;border-radius:8px;font-weight:900;cursor:pointer;width:100%;">CLOSE</button>
    `;
    document.body.appendChild(panel);
    setTimeout(() => panel.remove(), 15000);
  }

  // ─── MESSAGE LISTENER (from background.js) ─────────────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'EVO_TOAST') showToast(msg.msg, msg.color);
    if (msg.type === 'BRIDGE_STATUS') { bridgeOnline = msg.online; applyUpgradeGlow(msg.upgradeReady); }
    if (msg.type === 'OPEN_SENTIENT_CHAT') openSentientChat();
    if (msg.type === 'BUG_SNIPER_RESULT') runBugSniper(msg.result);
    sendResponse({ ok: true });
  });

  // ─── AUTO-SEED PAGE TO EVO BRAIN ──────────────────────────────
  async function autoSeedPage() {
    try {
      await fetch(`${BRIDGE}/api/browser-bridge/worktwin-capture`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: location.href, title: document.title,
          text: document.body?.innerText?.slice(0, 8000),
          capturedAt: new Date().toISOString(), source: 'auto-seed'
        })
      });
      bridgeOnline = true;
    } catch (_) { bridgeOnline = false; }
  }

  // ─── KEYBOARD SHORTCUT LISTENER ───────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') { e.preventDefault(); openSentientChat(); }
  });

  // Boot
  setTimeout(autoSeedPage, 2000);
})();
