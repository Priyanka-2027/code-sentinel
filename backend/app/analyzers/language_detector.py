import os
from pathlib import Path
from typing import Dict, List, Tuple

LANGUAGE_EXTENSIONS = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".mjs": "JavaScript",
    ".java": "Java",
    ".go": "Go",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".h": "C++",
    ".hpp": "C++",
    ".c": "C",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".html": "HTML",
    ".css": "CSS",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
    ".sql": "SQL",
    ".sh": "Shell",
}

MANIFEST_FILES = {
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "Pipfile": "Python",
    "setup.py": "Python",
    "package.json": "JavaScript/TypeScript",
    "tsconfig.json": "TypeScript",
    "pom.xml": "Java",
    "build.gradle": "Java",
    "go.mod": "Go",
    "CMakeLists.txt": "C++",
    "Makefile": "C/C++",
    "Cargo.toml": "Rust",
    "Gemfile": "Ruby",
}

IGNORED_DIRS = {
    ".git", ".svn", "node_modules", "venv", ".venv", "env", "__pycache__",
    ".pytest_cache", ".idea", ".vscode", "dist", "build", "target", "bin", "obj"
}

FRAMEWORK_SIGNATURES = {
    "FastAPI": ["from fastapi import", "import fastapi", "FastAPI("],
    "Flask": ["from flask import", "import flask", "Flask(__name__)"],
    "Django": ["django.http", "from django.urls", "django.db"],
    "Express": ["require('express')", "from 'express'", 'require("express")', 'from "express"'],
    "NestJS": ["@nestjs/common", "@Controller(", "@Injectable("],
    "React": ["from 'react'", 'from "react"', "React.useState", "useState("],
    "Spring Boot": ["@SpringBootApplication", "@RestController", "@RequestMapping"],
    "Gin": ["github.com/gin-gonic/gin"],
}

class LanguageDetector:
    @staticmethod
    def detect_languages(repo_path: Path) -> Tuple[Dict[str, float], Dict[str, int], List[str], List[str]]:
        """
        Returns:
        - language_percentages: Dict[str, float]
        - language_loc: Dict[str, int]
        - detected_frameworks: List[str]
        - unsupported_languages: List[str]
        """
        loc_by_language: Dict[str, int] = {}
        files_by_language: Dict[str, int] = {}
        frameworks_found = set()
        unsupported = set()

        supported_primary = {"Python", "JavaScript", "TypeScript", "Java", "Go", "C++"}

        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

            for file in files:
                file_path = Path(root) / file
                ext = file_path.suffix.lower()

                if ext in LANGUAGE_EXTENSIONS:
                    lang = LANGUAGE_EXTENSIONS[ext]
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            lines = len([l for l in content.splitlines() if l.strip()])
                            loc_by_language[lang] = loc_by_language.get(lang, 0) + lines
                            files_by_language[lang] = files_by_language.get(lang, 0) + 1

                            if lang not in supported_primary and lang not in {"HTML", "CSS", "JSON", "YAML", "Markdown"}:
                                unsupported.add(lang)

                            for framework, signatures in FRAMEWORK_SIGNATURES.items():
                                for sig in signatures:
                                    if sig in content:
                                        frameworks_found.add(framework)
                                        break
                    except Exception:
                        pass

        total_loc = sum(loc_by_language.values())
        percentages: Dict[str, float] = {}
        if total_loc > 0:
            for lang, count in loc_by_language.items():
                pct = round((count / total_loc) * 100, 1)
                if pct >= 0.5:
                    percentages[lang] = pct

        return percentages, loc_by_language, list(frameworks_found), list(unsupported)
