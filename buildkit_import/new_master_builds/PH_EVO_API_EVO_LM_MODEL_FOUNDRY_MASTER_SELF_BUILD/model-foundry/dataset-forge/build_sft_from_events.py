import argparse, json

parser = argparse.ArgumentParser()
parser.add_argument("--events", required=True)
parser.add_argument("--out", required=True)
args = parser.parse_args()

written = 0
with open(args.events, "r", encoding="utf-8") as f, open(args.out, "w", encoding="utf-8") as out:
    for line in f:
        if not line.strip():
            continue
        ev = json.loads(line)
        training = ev.get("training", {})
        if not training.get("capture_enabled") and not training.get("captureEnabled"):
            continue
        if not (training.get("allowed_for_finetune") or training.get("allowedForFinetune")):
            continue
        payload = ev.get("payload", {})
        prompt = payload.get("user_prompt") or payload.get("prompt") or payload.get("visibleText") or ""
        answer = payload.get("accepted_final") or payload.get("acceptedFinal") or payload.get("output") or ""
        if not prompt or not answer:
            continue
        item = {
            "messages": [
                {"role": "system", "content": "You are Evo LM operating through PH Evo Studio laws: truth boundary, consent, proof, memory scope, and no fake execution."},
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": answer}
            ],
            "source_event_id": ev.get("event_id") or ev.get("eventId"),
            "tags": payload.get("tags", []),
            "approved_for_training": True
        }
        out.write(json.dumps(item, ensure_ascii=False) + "\n")
        written += 1
print({"ok": True, "written": written})
