import sqlite3
import os

DB_FILE = "sql_app.db"

def update_schema():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Add columns to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_company BOOLEAN DEFAULT 0")
        print("Added is_company to users")
    except sqlite3.OperationalError as e:
        print(f"Skipped is_company: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN additional_details VARCHAR")
        print("Added additional_details to users")
    except sqlite3.OperationalError as e:
        print(f"Skipped additional_details: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN id_proof_url VARCHAR")
        print("Added id_proof_url to users")
    except sqlite3.OperationalError as e:
        print(f"Skipped id_proof_url: {e}")

    # Add columns to registrations table
    try:
        cursor.execute("ALTER TABLE registrations ADD COLUMN rejection_reason VARCHAR")
        print("Added rejection_reason to registrations")
    except sqlite3.OperationalError as e:
        print(f"Skipped rejection_reason: {e}")

    conn.commit()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
