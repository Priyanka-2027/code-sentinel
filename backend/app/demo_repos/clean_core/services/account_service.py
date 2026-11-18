import os
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="CleanCore Account Service")

class AccountTransferPayload(BaseModel):
    source_account_id: str = Field(..., min_length=5, max_length=32)
    target_account_id: str = Field(..., min_length=5, max_length=32)
    amount: float = Field(..., gt=0.0, description="Transfer amount must be strictly positive")

def verify_authenticated_session(token: str = "valid"):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return {"user_id": "usr_992", "role": "verified"}

@app.post("/api/v1/accounts/transfer")
def execute_secure_transfer(payload: AccountTransferPayload, user: dict = Depends(verify_authenticated_session)):
    try:
        # Parameterized simulated query execution
        return {
            "status": "success",
            "source": payload.source_account_id,
            "target": payload.target_account_id,
            "amount": payload.amount
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Database transaction failed")
