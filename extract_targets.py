import json
import sys

evo_found = False
grid_found = False

with open(r'C:\Users\Noname\.gemini\antigravity-ide\brain\5010b156-2471-4a41-b325-7b86466087d8\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        
        if data['created_at'] <= '2026-06-19T00:28:47Z':
            continue
        
        if data.get('type') == 'PLANNER_RESPONSE':
            calls = data.get('tool_calls', [])
            for call in calls:
                if call['name'] in ['replace_file_content', 'multi_replace_file_content']:
                    target = call['args'].get('TargetFile', '')
                    
                    if 'EvoCopilot.jsx' in target and not evo_found:
                        print(f"--- FOUND EVOCOPILOT at {data['created_at']}")
                        if call['name'] == 'replace_file_content':
                            print(call['args'].get('TargetContent'))
                        else:
                            chunks = call['args'].get('ReplacementChunks', [])
                            if isinstance(chunks, str):
                                chunks = json.loads(chunks)
                            for chunk in chunks:
                                print("CHUNK START:")
                                print(chunk.get('TargetContent', ''))
                                print("CHUNK END")
                        evo_found = True
                        
                    if 'GridSphere.jsx' in target and not grid_found:
                        print(f"--- FOUND GRIDSPHERE at {data['created_at']}")
                        if call['name'] == 'replace_file_content':
                            print(call['args'].get('TargetContent'))
                        else:
                            chunks = call['args'].get('ReplacementChunks', [])
                            if isinstance(chunks, str):
                                chunks = json.loads(chunks)
                            for chunk in chunks:
                                print("CHUNK START:")
                                print(chunk.get('TargetContent', ''))
                                print("CHUNK END")
                        grid_found = True
        
        if evo_found and grid_found:
            break
