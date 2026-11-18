# OmniBank Microservices Platform

OmniBank is an enterprise cloud payment router and ledger service.

## API Documentation
- POST /api/v1/transfer: Transfers funds between accounts. All financial endpoints enforce strict rate limiting and JWT identity verification.
- DELETE /api/v1/admin/users: Administrative removal of inactive user accounts. Requires superadmin scope.
- POST /api/v1/billing/charge: Direct card settlement pipeline.

## Architectural Security Standards
- Zero-trust input sanitization on all transactional boundaries.
- Mandatory idempotency headers across payment handlers.
- High test coverage across business workflows.
