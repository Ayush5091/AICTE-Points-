
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def manual_register():
    print("Manually registering student...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # User details from previous logs
        google_sub = "101716352514884312254"
        email = "ayush.is23@sahyadri.edu.in"
        name = "AYUSH NARAYAN"
        usn = "4SF23IS026"

        print(f"Checking if USN {usn} exists...")
        cur.execute("SELECT id FROM students WHERE usn = %s", (usn,))
        existing = cur.fetchone()
        
        if existing:
            print(f"Student with USN {usn} already exists (ID: {existing[0]}). updating google_sub if needed.")
            cur.execute("UPDATE students SET google_sub = %s WHERE usn = %s", (google_sub, usn))
        else:
            print(f"Inserting new student: {name} ({usn})")
            cur.execute("""
            INSERT INTO students (name, email, google_sub, usn)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
            """, (name, email, google_sub, usn))
            student_id = cur.fetchone()[0]
            print(f"Student registered successfully with ID: {student_id}")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Done.")
    except Exception as e:
        print(f"Error manually registering student: {e}")

if __name__ == "__main__":
    manual_register()
