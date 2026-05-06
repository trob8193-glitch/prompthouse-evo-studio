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
        if not (training.get("allowed_for_preference_training") or training.get("allowedForPreferenceTraining")):
            continue
        p = ev.get("payload", {})
        prompt = p.get("prompt") or p.get("user_prompt")
        chosen = p.get("accepted_final") or p.get("chosen")
        rejected = p.get("rejected_output") or p.get("rejected")
        if prompt and chosen and rejected:
            out.write(json.dumps({"prompt": prompt, "chosen": chosen, "rejected": rejected, "source_event_id": ev.get("event_id") or ev.get("eventId")}, ensure_ascii=False) + "\n")
            written += 1
print({"ok": True, "written": written})
