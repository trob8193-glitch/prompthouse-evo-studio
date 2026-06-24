import json

with open(r'C:\Users\Noname\.gemini\antigravity-ide\brain\5010b156-2471-4a41-b325-7b86466087d8\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data['created_at'] > '2026-06-19T00:28:47Z':
            break
        
        if data.get('type') == 'PLANNER_RESPONSE':
            calls = data.get('tool_calls', [])
            for call in calls:
                if call['name'] in ['replace_file_content', 'multi_replace_file_content']:
                    target = call['args'].get('TargetFile', '')
                    if 'GridSphere.jsx' in target or 'EvoCopilot.jsx' in target:
                        print(f"--- {call['name']} on {target.split('src\\\\')[-1]} at {data['created_at']}")
