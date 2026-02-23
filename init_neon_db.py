import psycopg
import os
from dotenv import load_dotenv

# Load env vars manually or just use the hardcoded string for this script to be sure
# But better to load from .env after we update it.
# For now, I'll pass the URL directly to ensure it works with the script.

load_dotenv() # Call load_dotenv to load environment variables from .env file
DATABASE_URL = os.getenv("DATABASE_URL")

def init_neon_db():
    print("Initializing Neon Database...")
    try:
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()

        # Admins
        cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255)
        );
        """)

        # Students (Added google_sub)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            usn VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            google_sub VARCHAR(255) UNIQUE,
            phone_number VARCHAR(20),
            department VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Activities
        cur.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            points INTEGER NOT NULL,
            min_duration INTEGER DEFAULT 0,
            category VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE
        );
        """)

        # Activity Requests
        cur.execute("""
        CREATE TABLE IF NOT EXISTS activity_requests (
            id SERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id),
            activity_id INTEGER REFERENCES activities(id),
            description TEXT,
            status VARCHAR(50) DEFAULT 'pending', 
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP,
            approved_by INTEGER REFERENCES admins(id)
        );
        """)

        # Notifications
        cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Submissions
        cur.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id SERIAL PRIMARY KEY,
            request_id INTEGER REFERENCES activity_requests(id),
            proof TEXT,
            description TEXT,
            hours_spent DECIMAL(5,2),
            activity_date DATE,
            status VARCHAR(50) DEFAULT 'pending',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified_at TIMESTAMP,
            verified_by INTEGER REFERENCES admins(id)
        );
        """)

        # Seed Admins
        cur.execute("SELECT COUNT(*) FROM admins")
        if cur.fetchone()[0] == 0:
            print("Seeding default admin...")
            cur.execute("""
            INSERT INTO admins (email, password, name) 
            VALUES ('aicte.testing@gmail.com', 'aicte5091', 'AICTE Super Admin');
            """)

        # Seed Activities
        cur.execute("SELECT COUNT(*) FROM activities")
        if cur.fetchone()[0] == 0:
            print("Seeding activities...")
            cur.execute("""
            INSERT INTO activities (id, name, description, points, min_duration, category) VALUES 
            (10, 'Music/Dance Competition', 'Participation in music or dance competitions', 10, 0, 'Cultural'),
            (16, 'Blood Donation', 'Voluntary blood donation drives', 5, 0, 'Community Service'),
            (15, 'Project Competition', 'Participation in technical project competitions', 15, 0, 'Technical'),
            (13, 'Technical Paper Presentation', 'Presenting technical papers at conferences', 15, 0, 'Technical'),
            (5, 'State Level Sports', 'Participation in state-level sports competitions', 15, 0, 'Sports'),
            (6, 'National Level Sports', 'Participation in national-level sports competitions', 20, 0, 'Sports'),
            (7, 'University Sports', 'Participation in inter-university sports events', 10, 0, 'Sports'),
            (11, 'Drama/Theatre', 'Participation in theatrical productions', 10, 0, 'Cultural'),
            (9, 'Cultural Fest Participation', 'Active participation in college cultural festivals', 10, 0, 'Cultural'),
            (21, 'Industry Visit', 'Organized industry visits', 5, 8, 'Professional'),
            (14, 'Workshop Attendance', 'Attending technical workshops and seminars', 5, 8, 'Technical'),
            (8, 'Yoga & Fitness Programs', 'Certified yoga training or fitness programs', 5, 20, 'Sports'),
            (12, 'Hackathon Participation', 'Participation in coding hackathons', 15, 24, 'Technical'),
            (18, 'Environmental Awareness', 'Environmental conservation and awareness programs', 10, 30, 'Community Service'),
            (4, 'Swachh Bharat Abhiyan', 'Cleanliness drives and sanitation awareness programs', 10, 40, 'National Initiative'),
            (17, 'Teaching Underprivileged', 'Teaching sessions for underprivileged students', 10, 40, 'Community Service'),
            (20, 'Online Certification', 'Completion of recognized online courses', 10, 40, 'Professional'),
            (3, 'Unnat Bharat Abhiyan', 'Rural development initiatives and village adoption programs', 15, 60, 'National Initiative'),
            (2, 'NCC (National Cadet Corps)', 'Participation in NCC training and camps', 20, 80, 'National Initiative'),
            (1, 'NSS (National Service Scheme)', 'Participation in NSS activities including community service and social work', 20, 80, 'National Initiative'),
            (19, 'Internship', 'Industry internship (minimum 4 weeks)', 20, 160, 'Professional');
            """)
            
            # Reset the sequence since we're inserting explicit IDs
            cur.execute("SELECT setval(pg_get_serial_sequence('activities', 'id'), coalesce(max(id)+1, 1), false) FROM activities;")

        conn.commit()
        cur.close()
        conn.close()
        print("Neon Database Initialized Successfully.")

    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_neon_db()
