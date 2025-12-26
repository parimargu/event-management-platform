import sqlite3
import os

DB_FILE = "sql_app.db"

def update_schema():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Add profile columns to users table
    profile_columns = [
        ("phone", "VARCHAR"),
        ("city", "VARCHAR"),
        ("state", "VARCHAR"),
        ("country", "VARCHAR"),
        ("linkedin_url", "VARCHAR"),
        ("youtube_url", "VARCHAR"),
        ("facebook_url", "VARCHAR"),
        ("twitter_url", "VARCHAR"),
        ("instagram_url", "VARCHAR"),
        ("about_me", "VARCHAR"),
        ("gender", "VARCHAR"),
        ("dob", "VARCHAR"),
    ]

    for column_name, column_type in profile_columns:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            print(f"Added {column_name} to users")
        except sqlite3.OperationalError as e:
            print(f"Skipped {column_name}: {e}")

    conn.commit()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
