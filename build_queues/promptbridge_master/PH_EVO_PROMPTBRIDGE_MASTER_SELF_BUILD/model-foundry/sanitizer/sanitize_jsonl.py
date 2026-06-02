import json, re, sys
from pathlib import Path

SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9_-]{20,}"),
    re.compile(r"ghp_[0-9A-Za-z_]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
]

def clean_text(text: str):
    removed = False
    for pattern in SECRET_PATTERNS:
        if pattern.search(text):
            removed = True
            text = pattern.sub("[PH_EVO_SECRET_REMOVED]", text)
    return text, removed

def main(src, dest):
    src_path = Path(src)
    dest_path = Path(dest)
    count = 0
    removed_count = 0
    with src_path.open("r", encoding="utf-8") as f, dest_path.open("w", encoding="utf-8") as out:
        for line in f:
            raw, removed = clean_text(line)
            obj = json.loads(raw)
            out.write(json.dumps(obj, ensure_ascii=False) + "\n")
            count += 1
            removed_count += int(removed)
    print(json.dumps({"ok": True, "lines": count, "secret_lines_cleaned": removed_count}))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python sanitize_jsonl.py input.jsonl output.jsonl")
    main(sys.argv[1], sys.argv[2])
