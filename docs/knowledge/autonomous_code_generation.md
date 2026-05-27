# Autonomous Code Generation & Multi-Language Mastery
Version 1.0

This document serves as the core training data for the PromptHouse Evo Studio to learn how to autonomously generate code, learn new programming languages, and apply best practices across different stacks (Python, Java, C++, etc.).

---

## 1. Principles of Autonomous Code Generation

To generate its own code effectively, the studio must follow these core principles:
- **Intent Analysis**: Deeply analyze the requested feature or bug before writing a single line of code.
- **Modularity**: Always break complex logic into small, reusable functions and components.
- **Self-Correction (The Feedback Loop)**: After generating code, the studio must run tests or linters and read the errors to rewrite and fix its own mistakes.

## 2. Multi-Language Mastery

The studio must be capable of generating and understanding code beyond JavaScript/Node.js. Here are the core patterns for the requested languages:

### 🐍 Python (Data, AI, and Scripts)
*   **Aesthetics**: Follow PEP 8 guidelines. Use clear variable names and list comprehensions for efficiency.
*   **Key Concept**: Leverage Python for data processing, machine learning integrations, and quick file system scripts within the studio.
*   **Example Pattern (File I/O)**:
    ```python
    def read_knowledge_file(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return "File not found."
    ```

### ☕ Java (Enterprise & Structured Logic)
*   **Aesthetics**: Strong typing, clear class hierarchies, and verbose but safe object-oriented structures.
*   **Key Concept**: Use Java when the studio needs to build heavy, multi-threaded backend services or simulate enterprise-grade systems.
*   **Example Pattern (Singleton for State)**:
    ```java
    public class StudioState {
        private static StudioState instance;
        private StudioState() {}
        public static synchronized StudioState getInstance() {
            if (instance == null) {
                instance = new StudioState();
            }
            return instance;
        }
    }
    ```

### ⚙️ C++ (High Performance & Low-Level Control)
*   **Aesthetics**: Manual memory management (when needed), pointer safety, and maximum execution speed.
*   **Key Concept**: Use C++ for heavy mathematical calculations (like the "Precise Cutting" vectors) or building local fast-inference engines.
*   **Example Pattern (Pointer Safety)**:
    ```cpp
    #include <iostream>
    #include <memory>

    void processSignal(int data) {
        // Use smart pointers to avoid memory leaks
        std::unique_ptr<int> signalData = std::make_unique<int>(data);
        std::cout << "Processing signal: " << *signalData << std::endl;
    }
    ```

## 3. How the Studio Should "Learn" to Code
To learn a new language or pattern, the studio should:
1.  **Read Docs**: Ingest markdown guides or official documentation into its context.
2.  **Generate a Scratch File**: Write a simple "Hello World" or basic function in that language.
3.  **Run and Audit**: Use the terminal tools to run the script, read the errors, and adjust the code until it runs without errors.

---

*Signed,*
*The Sovereign Assistant Core (Antigravity)*
