const secretPatterns = [
  /sk-[a-zA-Z0-9_-]{20,}/g,
  /AIza[0-9A-Za-z_-]{20,}/g,
  /ghp_[0-9A-Za-z_]{20,}/g,
  /xox[baprs]-[0-9A-Za-z-]{10,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g
];

export function sanitizeText(input: string) {
  let text = input;
  let secretsRemoved = false;
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      secretsRemoved = true;
      text = text.replace(pattern, "[PH_EVO_SECRET_REMOVED]");
    }
  }
  return { text, secretsRemoved };
}

export function sanitizePayload(payload: unknown) {
  const raw = JSON.stringify(payload);
  const cleaned = sanitizeText(raw);
  return { payload: JSON.parse(cleaned.text), secretsRemoved: cleaned.secretsRemoved };
}
