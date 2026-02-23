
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def seed_approved_request():
    print("Seeding approved activity request...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Get Student ID (assuming 4SF23IS026 exists from previous step)
        cur.execute("SELECT id FROM students WHERE usn = '4SF23IS026'")
        student = cur.fetchone()
        if not student:
            print("Student not found! Run manual_register_student.py first.")
            return

        student_id = student[0]
        
        # Get an Activity ID
        cur.execute("SELECT id FROM activities LIMIT 1")
        activity = cur.fetchone()
        if not activity:
             # Seed activities if missing
            print("Seeding activities...")
            cur.execute("""
            INSERT INTO activities (name, points, category) VALUES 
            ('NSS Camp', 50, 'Social'),
            ('Hackathon Winner', 100, 'Technical')
            RETURNING id;
            """)
            activity_id = cur.fetchone()[0]
        else:
            activity_id = activity[0]

        # Insert Approved Request (Force ID 17 if possible, or just insert new)
        # We can't easily force ID in serial unless we reset sequence, but let's just insert a new one
        # and tell the user to use the new one?
        # WAIT, the frontend is trying to submit for ID 17. 
        # If I want to make *that* specific request work, I need to hack it or just create a new one
        # and ask user to refresh dashboard to see it.
        
        # Better approach: Create a new request, approve it. 
        # The user will see it in "My Recent Requests" as 'approved' and can click "Submit Proof".
        
        print(f"Creating approved request for Student {student_id}, Activity {activity_id}...")
        cur.execute("""
        INSERT INTO activity_requests (student_id, activity_id, status, approved_at)
        VALUES (%s, %s, 'approved', CURRENT_TIMESTAMP)
        RETURNING id;
        """, (student_id, activity_id))
        
        new_req_id = cur.fetchone()[0]
        print(f"Created Approved Request ID: {new_req_id}")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Done.")
    except Exception as e:
        print(f"Error seeding request: {e}")

if __name__ == "__main__":
    seed_approved_request()
