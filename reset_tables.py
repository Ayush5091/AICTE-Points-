
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def reset_tables():
    print("Resetting submissions and activity_requests tables...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Drop tables to clear data and allow schema recreation
        print("Dropping tables...")
        cur.execute("DROP TABLE IF EXISTS submissions;")
        # We need to drop activity_requests too if we want to clean slate requests
        # But if we drop it, we must ensure students/activities are safe (they are, as foreign keys point TO them)
        cur.execute("DROP TABLE IF EXISTS activity_requests CASCADE;")
        cur.execute("DROP TABLE IF EXISTS activities CASCADE;")
        
        conn.commit()
        print("Tables dropped.")
        cur.close()
        conn.close()
        
        # Now call init_neon_db to recreate them with new schema
        import init_neon_db
        init_neon_db.init_neon_db()
        
    except Exception as e:
        print(f"Error resetting tables: {e}")

if __name__ == "__main__":
    reset_tables()
