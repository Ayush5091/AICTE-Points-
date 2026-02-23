from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_connection
from typing import Optional
from fastapi import Depends, BackgroundTasks
from app.auth.dependencies import require_admin, require_student, get_current_user
from app.utils.mail import send_email_async

router = APIRouter()

class SubmissionCreate(BaseModel):
    request_id: int
    proof: str
    description: Optional[str] = None
    hours_spent: Optional[float] = None
    activity_date: Optional[str] = None # format YYYY-MM-DD

#EndPoint #4. Creating submission 
@router.post("/")
def create_submission(data: SubmissionCreate, student=Depends(require_student)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # 1. Check if the activity request exists and is approved for this student
        cur.execute(
            """
            SELECT id
            FROM activity_requests
            WHERE id = %s
            AND student_id = %s
            AND status = 'approved';
            """,
            (data.request_id, student["user_id"])
        )
        request_row = cur.fetchone()
        
        if not request_row:
            cur.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Activity request is not approved or does not exist"
            )

        # 2. Check if a submission already exists for this request
        cur.execute(
            "SELECT id FROM submissions WHERE request_id = %s",
            (data.request_id,)
        )
        if cur.fetchone():
            cur.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Submission already exists for this request"
            )
        
        

        cur.execute(
            """
            INSERT INTO submissions (request_id, proof, description, hours_spent, activity_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (data.request_id, data.proof, data.description, data.hours_spent, data.activity_date)
        )

        submission_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return {
            "submission_id": submission_id,
            "status": "pending",
            "message": "Submission created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


#EndPoint #5. Admin verifiying the submission
@router.put("/{submission_id}/verify")
def verify_submission(submission_id: int, background_tasks: BackgroundTasks, admin=Depends(require_admin)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            """
            UPDATE submissions
            SET status = 'approved',
                verified_by = %s,
                verified_at = CURRENT_TIMESTAMP
            WHERE id = %s
              AND status = 'pending'
            RETURNING id;
            """,
            (admin["user_id"], submission_id)
        )

        result = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Submission not found or already verified"
            )

        # Notify student about the verification
        try:
            cur.execute(
                """
                SELECT st.email, st.name, a.name 
                FROM submissions su
                JOIN activity_requests r ON su.request_id = r.id
                JOIN students st ON r.student_id = st.id
                JOIN activities a ON r.activity_id = a.id
                WHERE su.id = %s
                """,
                (submission_id,)
            )
            student_data = cur.fetchone()
            if student_data:
                student_email, student_name, activity_name = student_data
                email_body = f"""
                <h3>Activity Submission Verified</h3>
                <p>Hello {student_name},</p>
                <p>Congratulations! Your proof submission for the activity <strong>{activity_name}</strong> has been verified and approved by an administrator.</p>
                <p>The points for this activity have been awarded to your profile.</p>
                """
                background_tasks.add_task(send_email_async, f"Verified: {activity_name}", student_email, email_body)
        except Exception as email_err:
            print(f"Failed to queue student verification email: {email_err}")

        return {
            "submission_id": submission_id,
            "status": "approved",
            "message": "Submission verified successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


#Segment 2.2: Admin Viewing all submissions
@router.get("/")
def get_submissions(status: Optional[str] = None, admin=Depends(require_admin)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        if status:
            cur.execute(
                """
                SELECT sub.id, s.name, a.name, sub.status, sub.submitted_at
                FROM submissions sub
                JOIN activity_requests r ON sub.request_id = r.id
                JOIN students s ON r.student_id = s.id
                JOIN activities a ON r.activity_id = a.id
                WHERE sub.status = %s
                ORDER BY sub.submitted_at DESC;
                """,
                (status,)
            )
        else:
            cur.execute(
                """
                SELECT sub.id, s.name, a.name, sub.status, sub.submitted_at
                FROM submissions sub
                JOIN activity_requests r ON sub.request_id = r.id
                JOIN students s ON r.student_id = s.id
                JOIN activities a ON r.activity_id = a.id
                ORDER BY sub.submitted_at DESC;
                """
            )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return [
            {
                "submission_id": r[0],
                "student_name": r[1],
                "activity_name": r[2],
                "status": r[3],
                "submitted_at": r[4],
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_my_submissions(user=Depends(require_student)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT s.id, a.name, s.status, s.submitted_at, s.request_id
        FROM submissions s
        JOIN activity_requests r ON s.request_id = r.id
        JOIN activities a ON r.activity_id = a.id
        WHERE r.student_id = %s
        ORDER BY s.submitted_at DESC;
        """,
        (user["user_id"],)
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "submission_id": r[0],
            "activity": r[1],
            "status": r[2],
            "submitted_at": r[3],
            "request_id": r[4]
        }
        for r in rows
    ]
