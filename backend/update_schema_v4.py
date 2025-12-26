import sqlite3
import os
import random
import string

DB_FILE = "sql_app.db"

def generate_confirmation_id(event_id):
    """Generate unique confirmation ID"""
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"EVT-{event_id}-{random_part}"

def update_schema():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Add confirmation_id column to registrations table
    try:
        cursor.execute("ALTER TABLE registrations ADD COLUMN confirmation_id TEXT")
        print("Added confirmation_id to registrations")
        
        # Generate confirmation IDs for existing registrations
        cursor.execute("SELECT id, event_id FROM registrations WHERE confirmation_id IS NULL")
        registrations = cursor.fetchall()
        
        for reg_id, event_id in registrations:
            confirmation_id = generate_confirmation_id(event_id)
            # Ensure uniqueness
            while cursor.execute("SELECT id FROM registrations WHERE confirmation_id = ?", (confirmation_id,)).fetchone():
                confirmation_id = generate_confirmation_id(event_id)
            
            cursor.execute("UPDATE registrations SET confirmation_id = ? WHERE id = ?", (confirmation_id, reg_id))
        
        print(f"Generated confirmation IDs for {len(registrations)} existing registrations")
        
    except sqlite3.OperationalError as e:
        print(f"Skipped confirmation_id: {e}")

    conn.commit()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
