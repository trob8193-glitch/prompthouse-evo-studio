export async function getPreviewAccessStatus() {
  try {
    const res = await fetch('/api/preview-access/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.ok ? data : { ok: false, truthState: 'ERROR', error: data.error };
  } catch (error) {
    return { ok: false, truthState: 'ERROR', error: error.message };
  }
}

export async function getPreviewAccessOptions() {
  try {
    const res = await fetch('/api/preview-access/options');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.ok ? data : { ok: false, truthState: 'ERROR', error: data.error };
  } catch (error) {
    return { ok: false, truthState: 'ERROR', error: error.message };
  }
}
