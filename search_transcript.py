import json
with open(r'C:\Users\Noname\.gemini\antigravity-ide\brain\5010b156-2471-4a41-b325-7b86466087d8\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
            content = d.get('content', '')
            cl = content.lower()
            if '3 light' in cl or 'lightbeam' in cl or 'light beam' in cl or 'ph evo logo' in cl:
                print(f"Found in step {d.get('step_index')}: {d.get('type')}")
                print(content[:500])
                print('---')
        except Exception as e:
            pass
