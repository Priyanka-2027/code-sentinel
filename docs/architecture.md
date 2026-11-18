# CODE SENTINEL — Architecture & Engineering Specification

## 1. System Overview

**CODE SENTINEL** is an architecture-agnostic autonomous engineering auditor designed to uncover hidden vulnerabilities, architecture degradation, missing implementation safeguards, and correlated operational risks in software repositories.

Tagline: *"Find what is wrong. Discover what is missing. Prove the fix works."*

```mermaid
flowchart TD
    subgraph Ingestion["1. Ingestion Layer"]
        A1[GitHub Public Clone] --> IR[Normalized IR Builder]
        A2[ZIP Upload Engine] --> IR
        A3[Pre-seeded Demo Mode] --> IR
    end

    subgraph IR_Layer["2. Normalized Intermediate Representation"]
        IR --> B1[Symbols & Call Graph]
        IR --> B2[API Endpoints & Handlers]
        IR --> B3[Package Manifests & Dependencies]
        IR --> B4[Test Suites & Assertions]
        IR --> B5[Documentation References]
    end

    subgraph Specialist_Agents["3. Specialist Detection Agents"]
        B1 & B2 & B3 & B4 & B5 --> SA[Security Agent]
        B1 & B2 & B3 & B4 & B5 --> QA[Code Slop Agent]
        B1 & B2 & B3 & B4 & B5 --> MA[Missingness Intelligence Agent]
        B1 & B2 & B3 & B4 & B5 --> LA[Loose-End Agent]
    end

    subgraph Correlation["4. Cross-Issue Risk Correlation"]
        SA & QA & MA & LA --> RCA[Risk Correlation Agent]
        RCA --> Graph[Workflow Relationship Topology Graph]
        RCA --> Score[Engineering Health Score 0-100]
    end

    subgraph Proof_Fix["5. Proof Before Fix Engine"]
        SA & MA --> PBF[Contextual Unified Patch Proposal]
        PBF --> Sandbox[Isolated Workspace Replica]
        Sandbox --> Comp[Syntax & Compile Re-check]
        Sandbox --> SecRe[Security Scanner Re-evaluation]
        Sandbox --> Tests[Automated Regression Test Runner]
        Comp & SecRe & Tests --> ProofStatus[Verified / Needs Review]
    end

    subgraph Delivery["6. Actionable Intelligence Delivery"]
        Score & Graph & ProofStatus --> Dashboard[Premium SaaS Light Dashboard]
        Score & Graph & ProofStatus --> ReportGen[Export JSON & Printable PDF/HTML]
    end
```

## 2. The Core Innovation: Missingness Intelligence

Traditional scanners exclusively detect code patterns that already exist (such as regex matches for known patterns). Code Sentinel's **Missingness Intelligence** analyzes what **should exist according to software engineering contracts but does not exist**:
- **Missing Authentication & Authorization**: Detects mutating endpoints (`POST`, `PUT`, `DELETE`) operating without token validation or permission dependencies.
- **Missing Input Validation**: Identifies unconstrained, unvalidated parameters reaching critical business boundaries.
- **Missing Error Handling**: Flags naked exceptions and unhandled database queries that result in uncommitted transactions and stack trace leakage.
- **Missing Automated Tests**: Discovers endpoints and workflows with zero test coverage in the test directory.
- **Documentation vs Implementation Mismatches**: Matches OpenAPI/README specifications against actual source code to expose promised features that were never implemented.

## 3. Engineering Health Score Algorithm

The Engineering Health Score is calculated deterministically on a scale of `0.0` to `100.0`. It uses documented, configurable severity penalties:

$$\text{Health Score} = \max\left(0, 100 - \sum \text{Deductions}\right)$$

### Penalty Schedule
| Category | Critical | High | Medium | Low |
| :--- | :--- | :--- | :--- | :--- |
| **Security Finding** | -18.0 pts | -10.0 pts | -4.0 pts | -1.0 pt |
| **Missingness Gap** | -14.0 pts | -8.0 pts | -3.0 pts | -1.0 pt |
| **Loose End / Debt** | -6.0 pts | -3.0 pts | -1.0 pt | 0 pts |
| **Code Slop** | - | - | - | -1.5 pts |

Grade Thresholds:
- **Grade A (Healthy Posture)**: 80.0 – 100.0
- **Grade B (Elevated Risk)**: 60.0 – 79.9
- **Grade C (Significant Fragility)**: 40.0 – 59.9
- **Grade F (Critical Exposure)**: < 40.0

## 4. Isolated Sandbox Verification ("Proof Before Fix")

Code Sentinel guarantees that fixes are never applied speculatively:
1. Clones the repository into an ephemeral workspace directory (`data/sandbox/{id}`).
2. Applies the proposed unified diff safely.
3. Executes syntax & AST compilation validation (`python -m py_compile`).
4. Re-runs the Security & Missingness scanners against the patched sandbox to prove the finding is resolved.
5. Executes the regression test suite (`pytest`) in the sandbox within strict timeouts (30s).
6. Transitions status to `verified` only when all criteria pass.
7. Automatically destroys the temporary sandbox workspace.
