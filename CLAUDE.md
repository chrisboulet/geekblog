# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## DO NOT MODIFY THIS SECTION ##
### 🔄 Project Awareness & Context
- **OBLIGATOIRE**: Lire `METHOD_TASK.md` au début de chaque session pour comprendre la méthode de gestion structurée
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **WORKFLOW QUOTIDIEN**:
  1. Consulter `NEXT_TASKS.md` pour les actions immédiates (5-10 items max)
  2. Vérifier `TASK.md` pour les statuts actuels des tâches générales
  3. Référencer `MITIGATION_PLAN.md` pour les phases de mitigation en cours
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use .venv** (the virtual environment) whenever executing Python commands, including for unit tests.
- **Use context7 mcp whenever you need to validate the latest docs and code for any library**
- tu as analysé mon blog et produit des documents pour préserver le résultat de cette analyse.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 400 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For agents this looks like:
    - `agent.py` - Main agent definition and execution logic
    - `tools.py` - Tool functions used by the agent
    - `prompts.py` - System prompts
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.

### 🧪 Testing & Reliability
- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **GESTION STRUCTURÉE**: Suivre la méthode définie dans `METHOD_TASK.md`
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- **Mettre à jour `NEXT_TASKS.md`** quotidiennement avec les prochaines actions immédiates
- **Documenter dans `HISTORY.md`** les changements majeurs et leçons apprises
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.
- **RÉFÉRENCES**: Toujours référencer les sections spécifiques des plans (ex: MITIGATION_PLAN.md#phase-1-action-1.1)

### 📎 Style & Conventions
- **Use Python** as the primary language.
- **Follow PEP8**, use type hints, and format with `black`.
- **Use `pydantic` for data validation**.
- Use `FastAPI` for APIs and `SQLAlchemy` or `SQLModel` for ORM if applicable.
- Write **docstrings for every function** using the Google style:
  ```python
  def example():
      """
      Brief summary.

      Args:
          param1 (type): Description.

      Returns:
          type: Description.
      """
  ```

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified Python packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **always use zen precommit** to verify your code before you commit.
- **always use zen planner** to complete your planning tasks with details.
- **never forget to update the Readme.me, the PLANNING.md and the TASK.md**
- **remember that this application works under Docker**
- **Take your time, think deeply, we know this system will take a lot of time to develop. We focus on the current tasks, one at a time and we implement it to perfection.**

## END of DO NOT MODIFY ##
[... rest of the file remains unchanged ...]
