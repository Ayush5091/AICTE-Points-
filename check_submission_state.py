
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def check_db_state(request_id):
    print(f"Checking DB state for Request ID: {request_id}")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Check Activity Request
        cur.execute("SELECT id, student_id, activity_id, status FROM activity_requests WHERE id = %s", (request_id,))
        req = cur.fetchone()
        if req:
            print(f"Activity Request Found: {req}")
        else:
            print("Activity Request NOT FOUND.")

        # Check Existing Submissions
        cur.execute("SELECT id, status FROM submissions WHERE request_id = %s", (request_id,))
        sub = cur.fetchone()
        if sub:
            print(f"Submission Found: {sub}")
        else:
            print("No existing submission found.")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error checking DB: {e}")

if __name__ == "__main__":
    # check for the request_id seen in previous logs (17)
    check_db_state(17) 
