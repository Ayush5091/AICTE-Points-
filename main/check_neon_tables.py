
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def check_tables():
    print("Checking tables in Neon DB...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        tables = cur.fetchall()
        print("Tables found:", [t[0] for t in tables])
        
        # Check specific columns in students
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        """)
        columns = cur.fetchall()
        print("Students columns:", [c[0] for c in columns])

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error checking tables: {e}")

if __name__ == "__main__":
    check_tables()
