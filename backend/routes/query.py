from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db
from pydantic import BaseModel
import json
from typing import List, Dict, Any

router = APIRouter(prefix="/api/query", tags=["query"])

class QueryModel(BaseModel):
    sql: str

class ExportModel(BaseModel):
    sql: str

@router.post("/")
def execute_query(query: QueryModel, db: Session = Depends(get_db)):
    try:
        result = db.execute(text(query.sql))
        if result.returns_rows:
            rows = [dict(row._mapping) for row in result]
            return {"success": True, "data": rows, "count": len(rows)}
        db.commit()
        return {"success": True, "message": "Query executed", "rowcount": result.rowcount}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/export")
def export_data(export: ExportModel, db: Session = Depends(get_db)):
    """Export data from SQL query"""
    try:
        result = db.execute(text(export.sql))
        data = [dict(row._mapping) for row in result]
        
        # JSON export
        json_data = json.dumps(data, indent=2, default=str, ensure_ascii=False)
        
        # CSV export
        csv_data = ""
        if len(data) > 0:
            headers = list(data[0].keys())
            csv_lines = [",".join(headers)]
            for row in data:
                csv_lines.append(",".join([f'"{str(row[h])}"' for h in headers]))
            csv_data = "\n".join(csv_lines)
        
        return {
            "success": True,
            "json": json_data,
            "csv": csv_data,
            "count": len(data)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}