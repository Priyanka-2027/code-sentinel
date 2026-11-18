import ast
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
from app.analyzers.ir import (
    IRFile, IRSymbol, IREndpoint, IRTest, IRDocReference
)

class ASTAnalyzer:
    @staticmethod
    def analyze_file(file_path: Path, relative_path: str, language: str) -> IRFile:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            content = ""

        lines = content.splitlines()
        loc = len([l for l in lines if l.strip()])

        ir_file = IRFile(
            path=str(file_path),
            relative_path=relative_path,
            language=language,
            lines_of_code=loc,
            content=content
        )

        # Extract comments
        ir_file.comments = ASTAnalyzer._extract_comments(lines, language)

        if language == "Python":
            ASTAnalyzer._analyze_python(ir_file)
        elif language in ["JavaScript", "TypeScript"]:
            ASTAnalyzer._analyze_js_ts(ir_file)
        elif language == "Java":
            ASTAnalyzer._analyze_java(ir_file)
        elif language == "Go":
            ASTAnalyzer._analyze_go(ir_file)
        elif language == "Markdown":
            ASTAnalyzer._analyze_markdown(ir_file)

        return ir_file

    @staticmethod
    def _extract_comments(lines: List[str], language: str) -> List[Dict[str, Any]]:
        comments = []
        pattern_todo = re.compile(r"\b(TODO|FIXME|HACK|XXX|BUG|OPTIMIZE)\b(?:\s*[:\-]\s*(.*))?", re.IGNORECASE)

        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            comment_text = None
            if language == "Python" and "#" in line:
                comment_text = line.split("#", 1)[1].strip()
            elif language in ["JavaScript", "TypeScript", "Java", "Go", "C++", "C"]:
                if "//" in line:
                    comment_text = line.split("//", 1)[1].strip()
                elif "/*" in line and "*/" in line:
                    match = re.search(r"/\*(.*?)\*/", line)
                    if match:
                        comment_text = match.group(1).strip()

            if comment_text:
                m = pattern_todo.search(comment_text)
                if m:
                    tag = m.group(1).upper()
                    desc = m.group(2) if m.group(2) else comment_text
                    comments.append({
                        "tag": tag,
                        "line": idx,
                        "text": desc.strip(),
                        "raw": stripped
                    })
        return comments

    @staticmethod
    def _analyze_python(ir_file: IRFile):
        try:
            tree = ast.parse(ir_file.content)
        except Exception:
            ir_file.ast_supported = False
            return

        imported_names = set()
        used_names = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imported_names.add((alias.asname or alias.name, node.lineno))
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imported_names.add((alias.asname or alias.name, node.lineno))
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                used_names.add(node.id)

        # Check for unused imports
        for name, line_num in imported_names:
            base_name = name.split(".")[0]
            if base_name not in used_names and base_name not in ["__future__"]:
                sym = IRSymbol(
                    name=name,
                    kind="unused_import",
                    file_path=ir_file.relative_path,
                    line_start=line_num,
                    line_end=line_num,
                    docstring="Unused import detected via AST analysis."
                )
                ir_file.symbols.append(sym)

        # Check functions, routes, complexity, empty functions
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                ASTAnalyzer._process_py_function(node, ir_file)
            elif isinstance(node, ast.ClassDef):
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        ASTAnalyzer._process_py_function(item, ir_file, class_name=node.name)

    @staticmethod
    def _process_py_function(node: ast.FunctionDef, ir_file: IRFile, class_name: str = None):
        func_name = node.name
        decorators = []
        for dec in node.decorator_list:
            if isinstance(dec, ast.Name):
                decorators.append(dec.id)
            elif isinstance(dec, ast.Call):
                if isinstance(dec.func, ast.Name):
                    decorators.append(dec.func.id)
                elif isinstance(dec.func, ast.Attribute):
                    decorators.append(f"{ast.unparse(dec.func.value)}.{dec.func.attr}" if hasattr(ast, "unparse") else dec.func.attr)

        # Cyclomatic complexity approximation
        branches = 1
        has_error_handling = False
        sensitive_ops = []
        calls = []

        for sub in ast.walk(node):
            if isinstance(sub, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With)):
                branches += 1
            if isinstance(sub, ast.BoolOp):
                branches += len(sub.values) - 1
            if isinstance(sub, ast.Try):
                has_error_handling = True
            if isinstance(sub, ast.Call):
                call_str = ""
                if hasattr(ast, "unparse"):
                    try:
                        call_str = ast.unparse(sub.func)
                    except Exception:
                        pass
                if not call_str and isinstance(sub.func, ast.Name):
                    call_str = sub.func.id
                elif not call_str and isinstance(sub.func, ast.Attribute):
                    call_str = sub.func.attr

                if call_str:
                    calls.append(call_str)
                    if any(s in call_str.lower() for s in ["execute", "raw", "sql", "cursor"]):
                        sensitive_ops.append("sql_query")
                    if any(s in call_str.lower() for s in ["system", "popen", "subprocess", "exec"]):
                        sensitive_ops.append("command_execution")
                    if any(s in call_str.lower() for s in ["open", "remove", "unlink"]):
                        sensitive_ops.append("file_io")
                    if any(s in call_str.lower() for s in ["transfer", "charge", "payment", "payout"]):
                        sensitive_ops.append("financial_transaction")

        # Check if function is empty stub (considering optional docstring + pass/None)
        is_empty = False
        body_without_docstring = [
            b for b in node.body
            if not (isinstance(b, ast.Expr) and isinstance(b.value, ast.Constant) and isinstance(b.value.value, str))
        ]

        if len(body_without_docstring) == 0:
            is_empty = True
        elif len(body_without_docstring) == 1:
            body_item = body_without_docstring[0]
            if isinstance(body_item, ast.Pass):
                is_empty = True
            elif isinstance(body_item, ast.Expr) and isinstance(body_item.value, ast.Constant) and body_item.value.value is Ellipsis:
                is_empty = True
            elif isinstance(body_item, ast.Return) and body_item.value is None:
                is_empty = True

        sym = IRSymbol(
            name=f"{class_name}.{func_name}" if class_name else func_name,
            kind="empty_stub" if is_empty else "function",
            file_path=ir_file.relative_path,
            line_start=node.lineno,
            line_end=node.end_lineno or node.lineno,
            decorators=decorators,
            complexity=branches,
            calls=calls
        )
        ir_file.symbols.append(sym)

        # Check for Test functions
        if func_name.startswith("test_") or "test" in ir_file.relative_path.lower():
            assert_count = sum(1 for sub in ast.walk(node) if isinstance(sub, ast.Assert))
            is_trivial = False
            for sub in ast.walk(node):
                if isinstance(sub, ast.Assert):
                    if isinstance(sub.test, ast.Constant) and sub.test.value is True:
                        is_trivial = True
            if assert_count == 0 or is_trivial:
                ir_file.tests.append(IRTest(
                    test_name=func_name,
                    file_path=ir_file.relative_path,
                    line_number=node.lineno,
                    is_empty_or_trivial=True,
                    assert_count=assert_count
                ))
            else:
                ir_file.tests.append(IRTest(
                    test_name=func_name,
                    file_path=ir_file.relative_path,
                    line_number=node.lineno,
                    is_empty_or_trivial=False,
                    assert_count=assert_count
                ))

        # Check for API Endpoints (FastAPI, Flask)
        route_decorator = None
        http_method = None
        route_path = None

        for dec in node.decorator_list:
            if isinstance(dec, ast.Call):
                dec_func = ""
                if isinstance(dec.func, ast.Attribute):
                    dec_func = dec.func.attr.upper()
                elif isinstance(dec.func, ast.Name):
                    dec_func = dec.func.id.upper()

                if dec_func in ["GET", "POST", "PUT", "DELETE", "PATCH", "ROUTE"]:
                    http_method = "GET" if dec_func == "ROUTE" else dec_func
                    if dec.args and isinstance(dec.args[0], ast.Constant):
                        route_path = str(dec.args[0].value)
                    elif dec.args and hasattr(ast, "Str") and isinstance(dec.args[0], getattr(ast, "Str")):
                        route_path = dec.args[0].s

        if http_method and route_path:
            # Check authentication: look for Depends(auth...) or security tokens
            has_auth = False
            has_validation = False
            params = []

            for arg in node.args.args:
                params.append(arg.arg)
                if any(k in arg.arg.lower() for k in ["auth", "token", "user", "current_user", "credentials"]):
                    has_auth = True
                if arg.annotation:
                    # Parameter has type annotations
                    has_validation = True

            # Also check decorators for auth
            for d in decorators:
                if any(k in d.lower() for k in ["auth", "protect", "jwt", "login_required", "permission"]):
                    has_auth = True

            endpoint = IREndpoint(
                http_method=http_method,
                path=route_path,
                handler_name=func_name,
                file_path=ir_file.relative_path,
                line_number=node.lineno,
                has_auth=has_auth,
                has_input_validation=has_validation,
                has_error_handling=has_error_handling,
                parameters=params,
                sensitive_operations=sensitive_ops
            )
            ir_file.endpoints.append(endpoint)

    @staticmethod
    def _analyze_js_ts(ir_file: IRFile):
        content = ir_file.content
        lines = content.splitlines()

        # Regex detection for Express/NestJS/Fastify endpoints
        endpoint_pattern = re.compile(r"(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)
        for idx, line in enumerate(lines, start=1):
            m = endpoint_pattern.search(line)
            if m:
                method = m.group(1).upper()
                path = m.group(2)
                # Check for auth middleware in the line or following
                has_auth = bool(re.search(r"(auth|passport|verify|jwt|protect|token)", line, re.IGNORECASE))
                has_val = bool(re.search(r"(validate|zod|joi|check|body\(|param\()", line, re.IGNORECASE))
                ir_file.endpoints.append(IREndpoint(
                    http_method=method,
                    path=path,
                    handler_name=f"route_{method}_{idx}",
                    file_path=ir_file.relative_path,
                    line_number=idx,
                    has_auth=has_auth,
                    has_input_validation=has_val,
                    has_error_handling=False
                ))

        # Check for test files
        if "test" in ir_file.relative_path.lower() or "spec" in ir_file.relative_path.lower():
            test_pattern = re.compile(r"\b(?:it|test)\s*\(\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)
            for idx, line in enumerate(lines, start=1):
                m = test_pattern.search(line)
                if m:
                    # Check if body has empty expect or expect(true).toBe(true)
                    is_trivial = "expect(true).toBe(true)" in content or "assert(true)" in content
                    ir_file.tests.append(IRTest(
                        test_name=m.group(1),
                        file_path=ir_file.relative_path,
                        line_number=idx,
                        is_empty_or_trivial=is_trivial,
                        assert_count=1
                    ))

    @staticmethod
    def _analyze_java(ir_file: IRFile):
        lines = ir_file.content.splitlines()
        for idx, line in enumerate(lines, start=1):
            # @GetMapping("/..."), @PostMapping("/...")
            m = re.search(r"@(?:(Get|Post|Put|Delete)Mapping|RequestMapping)\s*\(\s*(?:value\s*=\s*)?[\"']([^\"']+)[\"']", line)
            if m:
                method = m.group(1).upper() if m.group(1) else "GET"
                path = m.group(2)
                has_auth = "@PreAuthorize" in ir_file.content or "@Secured" in ir_file.content
                ir_file.endpoints.append(IREndpoint(
                    http_method=method,
                    path=path,
                    handler_name=f"handler_L{idx}",
                    file_path=ir_file.relative_path,
                    line_number=idx,
                    has_auth=has_auth,
                    has_input_validation="@Valid" in line or "@Validated" in line
                ))

    @staticmethod
    def _analyze_go(ir_file: IRFile):
        lines = ir_file.content.splitlines()
        for idx, line in enumerate(lines, start=1):
            # r.GET("/...", handler), r.POST("/...", handler)
            m = re.search(r"\.(GET|POST|PUT|DELETE)\s*\(\s*[\"']([^\"']+)[\"']", line)
            if m:
                method = m.group(1).upper()
                path = m.group(2)
                ir_file.endpoints.append(IREndpoint(
                    http_method=method,
                    path=path,
                    handler_name=f"go_handler_L{idx}",
                    file_path=ir_file.relative_path,
                    line_number=idx,
                    has_auth="auth" in line.lower() or "token" in line.lower(),
                    has_input_validation="bind" in line.lower()
                ))

    @staticmethod
    def _analyze_markdown(ir_file: IRFile):
        lines = ir_file.content.splitlines()
        for idx, line in enumerate(lines, start=1):
            # Documentation of endpoints e.g. "POST /api/v1/transfer: Transfers funds with rate limiting"
            m = re.search(r"\b(GET|POST|PUT|DELETE)\s+([/\w\-{}]+)(?::|\s+-|\s+—)\s*(.*)", line)
            if m:
                method = m.group(1).upper()
                path = m.group(2)
                desc = m.group(3)
                ir_file.doc_references.append(IRDocReference(
                    source_file=ir_file.relative_path,
                    title=f"{method} {path}",
                    documented_endpoint=path,
                    promised_behaviors=[w.strip() for w in desc.split(",") if w.strip()],
                    line_number=idx
                ))
