import os
import json
import urllib.request
import urllib.error

def analyze_tools():
    # Fetch API Key
    api_key = os.environ.get("OPENAI_API_KEY")
    
    # In this highly autonomous studio, the key might be in the .env file but python os.environ might not have it if not exported.
    # We will attempt to read .env directly if missing.
    if not api_key:
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('OPENAI_API_KEY='):
                        api_key = line.strip().split('=', 1)[1]
                        break
        except Exception:
            pass

    if not api_key:
        print("none") # Signal bash script that no improvements can be made
        return

    # To prevent rampant loops during stable phases, we randomly determine if an invention is needed,
    # or we can do a real API call. For the sake of cost-saving and precision, we'll do a quick API call.
    try:
        data = json.dumps({
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are the Self-Invention Engine of PromptHouse Evo Studio. Respond ONLY with the exact filename of a new generic utility tool we should build (e.g. 'scripts/util_cleaner.js'), or respond with 'none' if our tools are sufficient."
                },
                {
                    "role": "user",
                    "content": "Analyze our current toolset based on general dev studio needs. Do we need a new invention? If not, output none."
                }
            ],
            "max_tokens": 10
        }).encode('utf-8')

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            suggestion = result['choices'][0]['message']['content'].strip()
            # If the engine hallucinates backticks, strip them
            suggestion = suggestion.replace('`', '')
            
            # Print the exact string back to the bash script
            print(suggestion.lower())

    except Exception as e:
        # If anything fails, return none so the daemon sleeps
        print("none")

if __name__ == "__main__":
    analyze_tools()
