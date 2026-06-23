import json
with open(r'C:\Users\Noname\.gemini\antigravity-ide\brain\5010b156-2471-4a41-b325-7b86466087d8\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
            if d.get('step_index') == 389:
                print(d.get('content'))
        except:
            pass
