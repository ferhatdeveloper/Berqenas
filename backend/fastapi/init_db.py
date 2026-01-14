from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models.user import User
from services.auth import get_password_hash
import sys

def init_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists.")
            return

        # Create admin
        new_admin = User(
            username="admin",
            email="admin@berqenas.com",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print("Admin user 'admin' created with password 'admin123'")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    init_admin()
