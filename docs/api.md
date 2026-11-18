# CODE SENTINEL — REST API Reference

Base URL: `http://localhost:8000/api`

## 1. Repositories API

### `GET /api/repositories`
Lists all connected repositories with scan status, LOC, and latest health ratings.

### `GET /api/repositories/{id}`
Returns details for a single repository.

### `POST /api/repositories/upload`
Uploads and safely decompresses a ZIP archive with ZipSlip path traversal protection.
- Content-Type: `multipart/form-data`
- Body: `name` (string), `description` (string), `file` (binary zip)

### `POST /api/repositories/connect`
Clones a public Git / GitHub repository using shallow depth.
- Body:
```json
{
  "name": "My Repo",
  "github_url": "https://github.com/org/repo",
  "branch": "main"
}
```

### `POST /api/repositories/demo/{demo_type}`
Instantly loads a pre-seeded demo repository (`omnibank` or `clean`) with 1-click execution.

---

## 2. Scans API

### `POST /api/scans`
Launches a 10-stage autonomous audit on a target repository in a background thread.
- Body: `{"repository_id": "repo_xxx"}`

### `GET /api/scans/{id}`
Retrieves full scan status, metrics, and health score.

### `GET /api/scans/{id}/progress`
Real-time progress polling endpoint returning completion percentage (0-100%) and 10 individual stage statuses.

### `GET /api/scans/{id}/findings`
Returns all findings discovered during the scan with optional filtering:
- Query parameters:
  - `category`: `security` | `quality` | `missingness` | `loose_end`
  - `severity`: `critical` | `high` | `medium` | `low`
  - `gap_type`: filter missingness categories
  - `search`: search keywords across title, description, and file paths

---

## 3. Findings & Patches API

### `GET /api/findings/{id}`
Returns single finding details.

### `PATCH /api/findings/{id}/status`
Updates finding lifecycle state (`open`, `resolved`, `dismissed`).

### `POST /api/findings/{id}/patch`
Generates a contextual unified diff patch proposal for a finding.

### `GET /api/scans/{id}/patches`
Lists all generated patch proposals for a scan.

### `POST /api/patches/{id}/verify`
Executes isolated sandbox verification:
- Body: `{"approved": true}`
- Response includes `status`, `sandbox_log`, `before_metrics`, and `after_metrics`.

---

## 4. Risk Relationships API

### `GET /api/scans/{id}/relationships`
Returns cross-issue compound risk clusters with complete node and edge graph topology.

---

## 5. Reports API

### `GET /api/reports/{scan_id}`
Returns the structured JSON audit report.

### `GET /api/reports/{scan_id}/html`
Renders the standalone printable HTML report.

### `GET /api/reports/{scan_id}/download?format=html|json`
Downloads the report as an attachment.
