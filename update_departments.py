import os
import psycopg
import re
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def extract_dept(email):
    if not email:
        return None
    local_part = email.split('@')[0]
    parts = local_part.split('.')
    if len(parts) > 1:
        last_part = parts[-1]
        match = re.match(r'^([a-zA-Z]+)\d*$', last_part)
        if match:
            code = match.group(1).lower()
            dept_map = {
                'cs': 'Computer Science',
                'is': 'Information Science',
                'ai': 'AIML',
                'ec': 'Electronics and Communications',
                'me': 'Mechanical',
                'ra': 'Robotics'
            }
            return dept_map.get(code, code.upper())
    return None

def update_students():
    print("Updating existing students...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("SELECT id, email FROM students WHERE department IS NULL OR department = ''")
        students = cur.fetchall()
        
        updated_count = 0
        for student_id, email in students:
            dept = extract_dept(email)
            if dept:
                cur.execute("UPDATE students SET department = %s WHERE id = %s", (dept, student_id))
                updated_count += 1
                print(f"Updated student {student_id} ({email}) to {dept}")
                
        conn.commit()
        cur.close()
        conn.close()
        print(f"Successfully updated {updated_count} students.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_students()
