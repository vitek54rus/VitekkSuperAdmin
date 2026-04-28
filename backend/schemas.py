from pydantic import BaseModel
from typing import Dict, Any, Optional

class QueryModel(BaseModel):
    sql: str

class InsertModel(BaseModel):
    table: str
    data: Dict[str, Any]

class UpdateModel(BaseModel):
    table: str
    id: int
    data: Dict[str, Any]

class TableCreateModel(BaseModel):
    name: str
    columns: str

class ConnectionModel(BaseModel):
    host: str
    port: int
    database: str
    username: str
    password: str