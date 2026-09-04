"""
Prompt loader — reads the shared persona once and exposes it to every stage.
"""

import pathlib

_PROMPTS_DIR = pathlib.Path(__file__).parent

PERSONA = (_PROMPTS_DIR / "persona.md").read_text(encoding="utf-8").strip()
