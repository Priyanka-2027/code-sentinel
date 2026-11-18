from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any

@dataclass
class IRSymbol:
    name: str
    kind: str  # function, class, variable, import, constant
    file_path: str
    line_start: int
    line_end: int
    parameters: List[str] = field(default_factory=list)
    docstring: Optional[str] = None
    decorators: List[str] = field(default_factory=list)
    complexity: int = 1
    calls: List[str] = field(default_factory=list)

@dataclass
class IREndpoint:
    http_method: str  # GET, POST, PUT, DELETE, PATCH
    path: str
    handler_name: str
    file_path: str
    line_number: int
    has_auth: bool = False
    auth_mechanism: Optional[str] = None
    has_input_validation: bool = False
    validation_mechanism: Optional[str] = None
    has_error_handling: bool = False
    parameters: List[str] = field(default_factory=list)
    sensitive_operations: List[str] = field(default_factory=list)  # sql, exec, file, payment, db_write

@dataclass
class IRDependency:
    name: str
    version: Optional[str] = None
    manifest_file: str = ""
    is_dev: bool = False
    known_vulnerabilities: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class IRTest:
    test_name: str
    file_path: str
    line_number: int
    target_function: Optional[str] = None
    target_endpoint: Optional[str] = None
    test_type: str = "unit"  # unit, integration, e2e
    is_empty_or_trivial: bool = False
    assert_count: int = 1

@dataclass
class IRDocReference:
    source_file: str  # README.md, swagger.yaml, docstring
    title: str
    documented_endpoint: Optional[str] = None
    promised_behaviors: List[str] = field(default_factory=list)
    line_number: int = 1

@dataclass
class IRFile:
    path: str
    relative_path: str
    language: str
    lines_of_code: int
    content: str
    symbols: List[IRSymbol] = field(default_factory=list)
    endpoints: List[IREndpoint] = field(default_factory=list)
    dependencies: List[IRDependency] = field(default_factory=list)
    tests: List[IRTest] = field(default_factory=list)
    doc_references: List[IRDocReference] = field(default_factory=list)
    comments: List[Dict[str, Any]] = field(default_factory=list)  # type, text, line
    ast_supported: bool = True

@dataclass
class IRRepository:
    id: str
    root_path: str
    files: Dict[str, IRFile] = field(default_factory=dict)
    detected_languages: Dict[str, int] = field(default_factory=dict)
    manifest_files: List[str] = field(default_factory=list)
    total_loc: int = 0
    all_endpoints: List[IREndpoint] = field(default_factory=list)
    all_dependencies: List[IRDependency] = field(default_factory=list)
    all_tests: List[IRTest] = field(default_factory=list)
    all_docs: List[IRDocReference] = field(default_factory=list)
    unsupported_languages: List[str] = field(default_factory=list)
