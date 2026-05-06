import argparse, json, re

SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9_-]{20,}"),
    re.compile(r"ghp_[0-9A-Za-z_]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----"),
]

def sanitize_text(text: str):
    removed = False
    for pat in SECRET_PATTERNS:
        if pat.search(text):
            removed = True
            text = pat.sub("[PH_EVO_SECRET_REMOVED]", text)
    return text, removed

parser = argparse.ArgumentParser()
parser.add_argument("--in", dest="inp", required=True)
parser.add_argument("--out", dest="out", required=True)
args = parser.parse_args()

count = 0
removed_count = 0
with open(args.inp, "r", encoding="utf-8") as f, open(args.out, "w", encoding="utf-8") as out:
    for line in f:
        if not line.strip():
            continue
        text, removed = sanitize_text(line)
        removed_count += int(removed)
        obj = json.loads(text)
        obj.setdefault("sanitization", {})["secrets_removed"] = removed
        out.write(json.dumps(obj, ensure_ascii=False) + "\n")
        count += 1
print({"ok": True, "items": count, "items_with_secrets_removed": removed_count})
