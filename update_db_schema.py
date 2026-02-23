
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def update_schema():
    print("Updating schema...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Add google_sub column if not exists
        print("Adding google_sub column to students table...")
        cur.execute("""
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Schema updated successfully: added google_sub to students.")
    except Exception as e:
        print(f"Error updating schema: {e}")

if __name__ == "__main__":
    update_schema()
