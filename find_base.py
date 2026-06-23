import json
import sys

with open(r'C:\Users\Noname\.gemini\antigravity-ide\brain\5010b156-2471-4a41-b325-7b86466087d8\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        if data.get('type') == 'PLANNER_RESPONSE':
            for call in data.get('tool_calls', []):
                if call['name'] in ['replace_file_content', 'multi_replace_file_content']:
                    target = call['args'].get('TargetFile', '')
                    if 'EvoCopilot.jsx' in target:
                        chunks = call['args'].get('ReplacementChunks', [])
                        if isinstance(chunks, str):
                            try:
                                chunks = json.loads(chunks, strict=False)
                            except:
                                continue
                        for chunk in chunks:
                            text = chunk.get('ReplacementContent', '')
                            if 'clipPath' in text or 'radial-gradient' in text or 'blur' in text or 'bottom' in text:
                                print(f"Found at {data['created_at']}")
                                print(text[:500])
                                print("...")
