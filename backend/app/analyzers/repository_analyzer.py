import os
from pathlib import Path
from typing import Dict, List, Tuple
from app.analyzers.ir import IRRepository, IRFile
from app.analyzers.language_detector import LanguageDetector, LANGUAGE_EXTENSIONS, IGNORED_DIRS
from app.analyzers.ast_analyzer import ASTAnalyzer
from app.analyzers.dependency_analyzer import DependencyAnalyzer

class RepositoryAnalyzer:
    @staticmethod
    def build_ir(repo_id: str, repo_path: Path) -> IRRepository:
        ir_repo = IRRepository(
            id=repo_id,
            root_path=str(repo_path)
        )

        # 1. Detect languages & LOC
        percentages, loc_by_lang, frameworks, unsupported = LanguageDetector.detect_languages(repo_path)
        ir_repo.detected_languages = percentages
        ir_repo.unsupported_languages = unsupported

        # 2. Extract dependencies
        ir_repo.all_dependencies = DependencyAnalyzer.analyze_dependencies(repo_path)

        # 3. Walk all files and extract AST / IR
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

            for file in files:
                full_path = Path(root) / file
                try:
                    rel_path = str(full_path.relative_to(repo_path)).replace("\\", "/")
                except Exception:
                    rel_path = file

                ext = full_path.suffix.lower()
                lang = LANGUAGE_EXTENSIONS.get(ext, "Unknown")

                if lang in ["Python", "JavaScript", "TypeScript", "Java", "Go", "C++", "Markdown", "HTML", "CSS", "JSON", "YAML", "SQL"]:
                    ir_file = ASTAnalyzer.analyze_file(full_path, rel_path, lang)
                    ir_repo.files[rel_path] = ir_file
                    ir_repo.total_loc += ir_file.lines_of_code

                    # Collect endpoints, tests, docs
                    ir_repo.all_endpoints.extend(ir_file.endpoints)
                    ir_repo.all_tests.extend(ir_file.tests)
                    ir_repo.all_docs.extend(ir_file.doc_references)

        return ir_repo
