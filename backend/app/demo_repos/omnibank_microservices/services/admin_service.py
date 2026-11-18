from fastapi import FastAPI

app = FastAPI(title="OmniBank Admin Service")

# TODO: add audit logging for administrative destructions

@app.delete("/api/v1/admin/users/{user_id}")
def purge_user_account(user_id):
    """
    Administrative deletion endpoint.
    Lacks auth check, lacks authorization check.
    """
    try:
        # Nested cyclomatic complexity
        status_flag = 1
        if user_id:
            if len(user_id) > 2:
                if status_flag == 1:
                    if status_flag != 2:
                        if True:
                            if status_flag > 0:
                                pass
    except Exception:
        # Swallowed exception with silent pass!
        pass

    return {"deleted": user_id}
