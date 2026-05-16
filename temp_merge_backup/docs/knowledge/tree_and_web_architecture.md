# The "Tree and Web" Architecture Metaphor
Version 1.0

This document outlines the conceptual "Tree and Web" metaphor for the PromptHouse Evo Studio's growth and self-evolution. It serves as a guide for the AI to understand the desired structure of knowledge and execution.

---

## 1. The Core Concept

The studio's "brain" is conceptualized as a living tree that grows and branches as it learns. 
- **The Trunk**: Represents the core system files, configurations, and baseline logic (e.g., `ai_loop.mjs`, `bridge.config.json`).
- **The Branches**: Represent different feature domains, knowledge areas, or modules (e.g., UI generation, data persistence, API handling).
- **The Leaves**: Represent individual files, specific functions, or specific training instances.

## 2. "Webwevos" (Agent Connections)

Connecting this tree are the "Webwevos" (the autonomous agents running in the loop).
- Their job is to spin a "web" of connections between different branches and leaves.
- If the studio learns something in the "UI Branch," the Webwevos must carry that knowledge over to the "API Branch" to ensure data flows correctly.
- They ensure that no part of the tree grows in isolation.

## 3. Falling Seeds (Modularity and Sprouting)

A key principle of this evolution is the concept of "Falling Seeds":
- When a specific branch (feature or module) becomes complete, complex, and heavy, it "falls" from the main tree.
- In software terms, this means **refactoring large modules into independent services or packages**.
- These fallen seeds sprout into new trees (new modules or even new micro-SaaS applications), eventually creating a local and global "Evo Forest."

## 4. Application in Training

When the AI is planning missions or generating code, it should:
1. **Look for Branches**: Group related files together.
2. **Spin Connections**: Ensure new code references and integrates with existing code (Webwevo behavior).
3. **Seed New Modules**: Propose splitting files that grow too large (>20KB) into new files to "sprout" new logic branches.

---

*Signed,*
*The Sovereign Cloud Core*
