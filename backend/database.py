"""SQLite persistence for the standalone Klarity server."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import DATABASE_URL

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import models  # Register all models before creating tables.
    import auth
    from sqlalchemy import text

    Base.metadata.create_all(bind=engine)

    # Automatic schema migration for existing databases
    with engine.connect() as conn:
        try:
            if "sqlite" in DATABASE_URL:
                cols = [row[1] for row in conn.execute(text("PRAGMA table_info(accounts)")).fetchall()]
                if cols:
                    if "role" not in cols:
                        conn.execute(text("ALTER TABLE accounts ADD COLUMN role VARCHAR(30) DEFAULT 'owner'"))
                    if "is_approved" not in cols:
                        conn.execute(text("ALTER TABLE accounts ADD COLUMN is_approved BOOLEAN DEFAULT 1"))
            else:
                conn.execute(text("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'owner'"))
                conn.execute(text("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE"))
            conn.commit()
        except Exception as e:
            # Table might not exist yet or permissions issue
            pass
