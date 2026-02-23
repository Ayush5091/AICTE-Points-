from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from app.db import get_connection
from app.auth.auth import create_access_token
from app.auth.dependencies import get_current_user, require_admin, require_student
from app.auth.google_oauth import oauth
from jose import jwt
import os

router = APIRouter(tags=["Auth"])

class AdminLogin(BaseModel):
    email: str

@router.post("/admin/login")
def admin_login(data: AdminLogin):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM admins WHERE email = %s;",
        (data.email,)
    )

    admin = cur.fetchone()
    cur.close()
    conn.close()

    if admin is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "user_id": admin[0],
        "role": "admin"
    })

    return {"access_token": token, "token_type": "bearer"}



@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(400, "OAuth failed")
    
    google_sub = user_info["sub"]
    email = user_info["email"]
    name = user_info.get("name")


    if not email.endswith("@sahyadri.edu.in"):
        raise HTTPException(403, "Only college emails allowed")

    conn = get_connection()
    cur = conn.cursor()

    # Check if user exists
    cur.execute(
        "SELECT id FROM students WHERE google_sub = %s;",
        (google_sub,)
    )
    student = cur.fetchone()
    cur.close()
    conn.close()

    if student:
        # User exists, log them in
        student_id = student[0]
        jwt_token = create_access_token({
            "user_id": student_id,
            "role": "student" # Assuming students for now, enforced by query
        })
        
        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={jwt_token}")

    else:
        # New user, redirect to registration page
        # Create a temporary registration token
        register_token = create_access_token({
            "sub": google_sub,
            "email": email,
            "name": name,
            "type": "register"
        })
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/register?token={register_token}")


from typing import Optional

class RegisterRequest(BaseModel):
    token: Optional[str] = None
    usn: Optional[str] = None

@router.post("/register")
def register_student(data: RegisterRequest):
    with open("auth_debug.log", "a") as f:
        f.write(f"Registering with token: {data.token} and USN: {data.usn}\n")
    
    if not data.token:
        with open("auth_debug.log", "a") as f:
            f.write("ERROR: Token is missing from request\n")
        raise HTTPException(status_code=400, detail="Token is required")
        
    try:
        # Debug: print env vars
        with open("auth_debug.log", "a") as f:
            f.write(f"JWT_SECRET: {os.getenv('JWT_SECRET')}\n")
            f.write(f"JWT_ALGORITHM: {os.getenv('JWT_ALGORITHM')}\n")

        payload = jwt.decode(data.token, os.getenv("JWT_SECRET"), algorithms=[os.getenv("JWT_ALGORITHM")])
        
        with open("auth_debug.log", "a") as f:
            f.write(f"Decoded payload: {payload}\n")
            
        if payload.get("type") != "register":
            with open("auth_debug.log", "a") as f:
                f.write("Invalid token type\n")
            raise HTTPException(status_code=400, detail="Invalid token type")
    except Exception as e:
        with open("auth_debug.log", "a") as f:
            f.write(f"Token validation error: {e}\n")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    google_sub = payload["sub"]
    email = payload["email"]
    name = payload["name"]
    usn = data.usn.upper()

    conn = get_connection()
    cur = conn.cursor()

    # Check if USN already exists
    cur.execute("SELECT id FROM students WHERE usn = %s", (usn,))
    if cur.fetchone():
        cur.close()
        conn.close()
        with open("auth_debug.log", "a") as f:
            f.write(f"USN already registered: {usn}\n")
        raise HTTPException(status_code=400, detail="USN already registered")

    # Insert new student
    try:
        cur.execute(
            """
            INSERT INTO students (name, email, google_sub, usn)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """,
            (name, email, google_sub, usn)
        )
        student_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    cur.close()
    conn.close()

    # Create access token
    access_token = create_access_token({
        "user_id": student_id,
        "role": "student"
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


"""
class StudentLogin(BaseModel):
    usn: str
    name: str
    email: str

@router.post("/student/login")
def student_login(data: StudentLogin):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM students WHERE usn = %s;",
        (data.usn,)
    )

    student = cur.fetchone()

    if student is None:
        cur.execute(
            
            INSERT INTO students (name, usn, email)
            VALUES (%s, %s, %s)
            RETURNING id;
            ,
            (data.name, data.usn, data.email)
        )
        student_id = cur.fetchone()[0]
        conn.commit()
    else:
        student_id = student[0]

    cur.close()
    conn.close()

    token = create_access_token({
        "user_id": student_id,
        "role": "student"
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
"""