import sqlite3
import os

DB_FILE = "sql_app.db"

def update_schema():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Add is_active column to events table
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN is_active BOOLEAN DEFAULT 1")
        print("Added is_active to events")
    except sqlite3.OperationalError as e:
        print(f"Skipped is_active: {e}")

    conn.commit()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
