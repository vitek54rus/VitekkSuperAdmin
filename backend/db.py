from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tables():
    inspector = inspect(engine)
    return inspector.get_table_names()

def get_table_columns_info(table_name: str):
    """Получить информацию о колонках таблицы"""
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return [{"name": col["name"], "type": str(col["type"])} for col in columns]

def execute_sql(query: str, db):
    result = db.execute(text(query))
    if result.returns_rows:
        return [dict(row._mapping) for row in result]
    db.commit()
    return {"ok": True}