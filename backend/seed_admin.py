from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.registration import Registration
from app.core.security import get_password_hash

def create_admin_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@example.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user {admin_email} already exists.")
            return

        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123"),
            full_name="System Admin",
            role=UserRole.ADMIN,
            is_active=True,
            is_approved=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created successfully.\nEmail: {admin_email}\nPassword: admin123")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
