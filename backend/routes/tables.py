from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db, get_tables
from crud import create_table, drop_table
from pydantic import BaseModel

router = APIRouter(prefix="/api/tables", tags=["tables"])

class TableCreate(BaseModel):
    name: str
    columns: str

@router.get("/")
def list_tables(db: Session = Depends(get_db)):
    return {"tables": get_tables()}

@router.get("/{table_name}/columns")
def get_table_columns(table_name: str, db: Session = Depends(get_db)):
    """Получить структуру таблицы"""
    try:
        # Проверяем существует ли таблица
        result = db.execute(text(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position
        """))
        columns = [{"name": row[0], "type": row[1]} for row in result]
        return {"columns": columns}
    except Exception as e:
        return {"columns": [], "error": str(e)}

@router.post("/")
def create_new_table(table: TableCreate, db: Session = Depends(get_db)):
    """Создание новой таблицы"""
    try:
        # Экранируем имя таблицы
        table_name = table.name.strip()
        columns_sql = table.columns.strip()
        
        # Базовый SQL для создания таблицы
        sql = f'CREATE TABLE IF NOT EXISTS "{table_name}" (id SERIAL PRIMARY KEY, {columns_sql})'
        
        print(f"Executing SQL: {sql}")  # Для отладки
        
        db.execute(text(sql))
        db.commit()
        
        return {"success": True, "message": f"Table {table_name} created successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")  # Для отладки
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{table_name}")
def delete_table(table_name: str, db: Session = Depends(get_db)):
    """Удаление таблицы"""
    try:
        sql = f'DROP TABLE IF EXISTS "{table_name}"'
        db.execute(text(sql))
        db.commit()
        return {"success": True, "message": f"Table {table_name} dropped"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))