from app.demo_repos.clean_core.services.account_service import AccountTransferPayload

def test_transfer_validation():
    payload = AccountTransferPayload(
        source_account_id="ACC_1001",
        target_account_id="ACC_2002",
        amount=150.0
    )
    assert payload.amount == 150.0
    assert payload.source_account_id == "ACC_1001"
