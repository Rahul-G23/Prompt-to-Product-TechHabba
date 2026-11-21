"""
CivicLens Authentication & Role Selection Route
Provides role-based access for Administrators (Municipal Officers) and Citizens.
"""

from fastapi import APIRouter, HTTPException, status
from schemas import AuthLoginRequest, AuthLoginResponse, AuthUser

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ADMIN_DEFAULT_USER = {
    "username": "admin",
    "password": "admin123",
    "name": "Rajesh Kumar, KAS",
    "designation": "Assistant Executive Engineer & Triage Officer",
    "department": "Municipal Grievance Cell",
}

@router.post("/login", response_model=AuthLoginResponse)
def login(payload: AuthLoginRequest):
    """
    Authenticate as either an Administrator or Citizen.
    Supports straightforward credential verification or instant demo login for hackathon evaluation.
    """
    role = payload.role.strip().lower()

    if role == "admin":
        # Check credentials if supplied, allowing standard demo login
        if payload.password and payload.password != ADMIN_DEFAULT_USER["password"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator credentials. Demo password is 'admin123'."
            )
        
        user_name = payload.username or ADMIN_DEFAULT_USER["name"]
        return AuthLoginResponse(
            success=True,
            token="civiclens-admin-token-session",
            user=AuthUser(
                id="adm-101",
                name=ADMIN_DEFAULT_USER["name"],
                role="admin",
                designation=ADMIN_DEFAULT_USER["designation"],
                department=ADMIN_DEFAULT_USER["department"]
            )
        )

    elif role == "citizen":
        identifier = payload.phone_number or payload.username or "Ward 150 Resident"
        return AuthLoginResponse(
            success=True,
            token="civiclens-citizen-token-session",
            user=AuthUser(
                id="ctz-202",
                name=identifier if not identifier.isdigit() else f"Citizen (+91 {identifier[-10:]})",
                role="citizen",
                designation="Verified Resident",
                department="Ward 150, Zone 4"
            )
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported role '{payload.role}'. Must be 'admin' or 'citizen'."
        )
