import subprocess
import sys
import os

class LanguageMastery:
    def __init__(self):
        pass

    def detect_language(self, code_snippet):
        # Simple heuristic for now: if it contains 'def ' or 'import ', it's likely Python
        if 'def ' in code_snippet or 'import ' in code_snippet:
            return 'python'
        return 'unknown'

    def execute(self, code_snippet, language):
        if language != 'python':
            return ExecutionResult(False, "", f"Unsupported language: {language}")
        
        # Save code to a temp file to execute
        temp_file = "temp_snippet.py"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(code_snippet)
        
        try:
            # Run the python file and capture output
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=5 # Prevent infinite loops
            )
            
            # Clean up
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
            if result.returncode == 0:
                return ExecutionResult(True, result.stdout, "")
            else:
                return ExecutionResult(False, result.stdout, result.stderr)
                
        except subprocess.TimeoutExpired:
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return ExecutionResult(False, "", "Timeout: Code took too long to run.")
        except Exception as e:
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return ExecutionResult(False, "", str(e))

class ExecutionResult:
    def __init__(self, success, stdout, stderr):
        self.success = success
        self.stdout = stdout
        self.stderr = stderr
        
    def has_errors(self):
        return not self.success

class SelfCorrectionEngine:
    def __init__(self):
        pass

    def propose_correction(self, code_snippet, errors):
        print(f"🤖 [SelfCorrection] Analyzing errors: {errors}")
        print("🤖 [SelfCorrection] Fallback mode: I cannot call the LLM to fix this automatically yet.")
        # Return a simple fixed code if it's a known error, otherwise return original
        if "IndentationError" in errors:
            print("🤖 [SelfCorrection] Suggestion: Check your indentations!")
        return code_snippet # Return original for now in fallback

class AutonomousCodeExecutor:
    def __init__(self):
        self.language_mastery = LanguageMastery()
        self.self_correction = SelfCorrectionEngine()
        self.max_retries = 3

    def execute_code(self, code_snippet, attempt=1):
        print(f"🚀 [Executor] Attempt {attempt} to execute code...")
        language = self.language_mastery.detect_language(code_snippet)
        result = self.language_mastery.execute(code_snippet, language)
        
        if result.has_errors():
            print(f"❌ [Executor] Execution failed.")
            if attempt < self.max_retries:
                corrected_code = self.self_correction.propose_correction(code_snippet, result.stderr)
                if corrected_code != code_snippet:
                    return self.execute_code(corrected_code, attempt + 1)
                else:
                    print("🤖 [Executor] No corrections possible or proposed. Stopping.")
                    return result
            else:
                print("🤖 [Executor] Max retries reached. Stopping.")
                return result
                
        print(f"✅ [Executor] Execution successful!")
        return result

# Demonstration
if __name__ == "__main__":
    executor = AutonomousCodeExecutor()
    
    # Test a simple python script
    test_code = """
def greet(name):
    return f"Hello, {name}!"

print(greet("Sovereign User"))
"""
    
    result = executor.execute_code(test_code)
    print(f"\n📊 [Result] Success: {result.success}")
    print(f"📊 [Result] Output:\n{result.stdout}")
    if result.stderr:
        print(f"📊 [Result] Errors:\n{result.stderr}")
