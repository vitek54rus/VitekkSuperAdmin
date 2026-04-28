from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from crud import get_all_records, insert_record, update_record, delete_record
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/api/data", tags=["data"])

class InsertModel(BaseModel):
    table: str
    data: Dict[str, Any]

class UpdateModel(BaseModel):
    table: str
    id: int
    data: Dict[str, Any]

@router.get("/{table_name}")
def get_records(table_name: str, db: Session = Depends(get_db)):
    try:
        result = get_all_records(db, table_name)
        return {"records": result}
    except Exception as e:
        return {"records": [], "error": str(e)}

@router.post("/{table_name}")
def add_record(table_name: str, data: InsertModel, db: Session = Depends(get_db)):
    return insert_record(db, table_name, data.data)

@router.put("/{table_name}/{record_id}")
def edit_record(table_name: str, record_id: int, data: UpdateModel, db: Session = Depends(get_db)):
    return update_record(db, table_name, record_id, data.data)

@router.delete("/{table_name}/{record_id}")
def remove_record(table_name: str, record_id: int, db: Session = Depends(get_db)):
    return delete_record(db, table_name, record_id)