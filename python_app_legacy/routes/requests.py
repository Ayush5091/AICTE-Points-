from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_connection
from typing import Optional
from fastapi import Depends, BackgroundTasks
from app.auth.dependencies import require_student, require_admin, get_current_user
from app.utils.mail import send_email_async

router = APIRouter()

class ActivityRequestCreate(BaseModel):
    activity_id: int
    description: Optional[str] = None

#EndPoint #2. Creating activity request
@router.post("/")
def create_activity_request(req: ActivityRequestCreate, background_tasks: BackgroundTasks, student=Depends(require_student)):
    
    try:
        conn = get_connection()
        cur = conn.cursor()

        student_id = student["user_id"]

        cur.execute(
            """
            INSERT INTO activity_requests(student_id, activity_id, description)
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (student_id, req.activity_id, req.description)
        )
        
        request_id = cur.fetchone()[0]
        
        # Notify admins about the new request
        try:
            cur.execute("SELECT email FROM admins")
            admin_emails = [row[0] for row in cur.fetchall()]
            
            cur.execute("SELECT name FROM students WHERE id = %s", (student_id,))
            student_name = cur.fetchone()[0]
            
            cur.execute("SELECT name FROM activities WHERE id = %s", (req.activity_id,))
            activity_name = cur.fetchone()[0]
            
            for admin_email in admin_emails:
                email_body = f"""
                <h3>New Activity Request</h3>
                <p>Hello Admin,</p>
                <p>A new activity request has been submitted.</p>
                <ul>
                    <li><strong>Student:</strong> {student_name}</li>
                    <li><strong>Activity:</strong> {activity_name}</li>
                    <li><strong>Description:</strong> {req.description or 'No description provided'}</li>
                </ul>
                <p>Please log in to the dashboard to review this request.</p>
                """
                background_tasks.add_task(send_email_async, "New Activity Request Received", admin_email, email_body)
        except Exception as email_err:
            print(f"Failed to queue admin notification emails: {email_err}")

        conn.commit()

        cur.close()
        conn.close()

        return{
            "request_id": request_id,
            "status": "pending",
            "message": "Activity request Submitted"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#EndPoint #3. Handling approval of activity  
class ActivityRequestApprove(BaseModel):
    admin_id: int

@router.put("/{request_id}/approve")
def approve_activity_request(request_id: int, data: ActivityRequestApprove, background_tasks: BackgroundTasks, admin=Depends(require_admin)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            """
            UPDATE activity_requests
            SET status = 'approved',
                approved_at = CURRENT_TIMESTAMP,
                approved_by = %s
            WHERE id = %s
              AND status = 'pending'
            RETURNING id;
            """,
            (data.admin_id, request_id)
        )

        result = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Request not found or already processed"
            )

        # Notify student about the approval
        try:
            cur.execute(
                """
                SELECT s.email, s.name, a.name 
                FROM activity_requests r
                JOIN students s ON r.student_id = s.id
                JOIN activities a ON r.activity_id = a.id
                WHERE r.id = %s
                """,
                (request_id,)
            )
            student_data = cur.fetchone()
            if student_data:
                student_email, student_name, activity_name = student_data
                email_body = f"""
                <h3>Activity Request Approved</h3>
                <p>Hello {student_name},</p>
                <p>Good news! Your request for the activity <strong>{activity_name}</strong> has been approved.</p>
                <p>You can now proceed to upload your proof of completion in the portal.</p>
                """
                background_tasks.add_task(send_email_async, f"Approved: {activity_name}", student_email, email_body)
        except Exception as email_err:
            print(f"Failed to queue student approval email: {email_err}")

        return {
            "request_id": request_id,
            "status": "approved",
            "message": "Activity request approved"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#Segment 2: Admin Dashboard - Viewing all requests

@router.get("/")
def get_activity_requests(status: Optional[str] = None, admin=Depends(require_admin)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        if status:
            cur.execute(
                """
                SELECT r.id, s.name, a.name, r.status, r.requested_at
                FROM activity_requests r
                JOIN students s ON r.student_id = s.id
                JOIN activities a ON r.activity_id = a.id
                WHERE r.status = %s
                ORDER BY r.requested_at DESC;
                """,
                (status,)
            )
        else:
            cur.execute(
                """
                SELECT r.id, s.name, a.name, r.status, r.requested_at
                FROM activity_requests r
                JOIN students s ON r.student_id = s.id
                JOIN activities a ON r.activity_id = a.id
                ORDER BY r.requested_at DESC;
                """
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "request_id": r[0],
                "student_name": r[1],
                "activity_name": r[2],
                "status": r[3],
                "requested_at": r[4],
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_my_activity_requests(user=Depends(require_student)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT r.id, a.name, r.status, r.requested_at
        FROM activity_requests r
        JOIN activities a ON r.activity_id = a.id
        WHERE r.student_id = %s
        ORDER BY r.requested_at DESC;
        """,
        (user["user_id"],)
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "request_id": r[0],
            "activity": r[1],
            "status": r[2],
            "requested_at": r[3]
        }
        for r in rows
    ]
