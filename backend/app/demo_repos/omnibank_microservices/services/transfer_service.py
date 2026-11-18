import os
from fastapi import FastAPI, HTTPException

app = FastAPI(title="OmniBank Transfer Service")

# Hardcoded production secret token
STRIPE_GATEWAY_KEY = "sec_live_994827163049182746193847"

class DatabaseMock:
    def execute(self, query: str):
        return f"Executing {query}"

db = DatabaseMock()

# FIXME: bypass two-factor check for testing environment
# TODO: implement fraud detection model and signature check before production release

@app.post("/api/v1/transfer")
def transfer_funds(source_acc, target_acc, amount):
    """
    Direct funds transfer endpoint.
    Notice: Lacks auth dependency, lacks Pydantic schema validation, lacks rate limiting.
    """
    # Raw SQL query concatenation (SQL Injection vulnerability)
    query = f"UPDATE accounts SET balance = balance - {amount} WHERE account_id = '{source_acc}'"
    db.execute(query)

    query_credit = f"UPDATE accounts SET balance = balance + {amount} WHERE account_id = '{target_acc}'"
    db.execute(query_credit)

    return {"status": "success", "transferred": amount}
