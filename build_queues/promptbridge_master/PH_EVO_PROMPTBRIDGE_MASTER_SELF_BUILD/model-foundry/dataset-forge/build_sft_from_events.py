import json, sys
from pathlib import Path

def main(events_path, output_path):
    events = json.loads(Path(events_path).read_text(encoding="utf-8"))
    rows = events.get("events", events if isinstance(events, list) else [])
    written = 0
    with Path(output_path).open("w", encoding="utf-8") as out:
        for row in rows:
            payload = json.loads(row.get("payload_json", "{}")) if isinstance(row.get("payload_json"), str) else row.get("payload", {})
            prompt = payload.get("userPrompt") or payload.get("prompt") or payload.get("visibleText", "")[:2000]
            answer = payload.get("acceptedFinal") or payload.get("chosen") or payload.get("output")
            if not prompt or not answer:
                continue
            item = {
                "messages": [
                    {"role": "system", "content": "You are PH Evo Studio Model. Preserve consent, truth, proof, canon, and build discipline."},
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": answer}
                ],
                "metadata": {"source": row.get("source"), "event_id": row.get("id") or row.get("eventId")}
            }
            out.write(json.dumps(item, ensure_ascii=False) + "\n")
            written += 1
    print(json.dumps({"ok": True, "written": written, "output": output_path}))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python build_sft_from_events.py events.json output.jsonl")
    main(sys.argv[1], sys.argv[2])
