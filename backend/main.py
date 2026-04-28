from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from routes import tables_router, data_router, query_router
from db import get_db, get_tables

app = FastAPI(title="VITEKK SUPER ADMIN", description="Ultimate Database Control System")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(tables_router)
app.include_router(data_router)
app.include_router(query_router)

@app.get("/")
def root():
    return {"message": "VITEKK SUPER ADMIN API is running", "status": "ok", "version": "2.0"}

@app.get("/api/system/info")
def system_info(db: Session = Depends(get_db)):
    """Информация о системе"""
    try:
        # Версия PostgreSQL
        version_result = db.execute(text("SELECT version()"))
        version = version_result.fetchone()[0]
        
        # Количество таблиц
        tables = get_tables()
        
        # Размер базы данных
        size_result = db.execute(text("SELECT pg_database_size(current_database())"))
        db_size = size_result.fetchone()[0]
        size_mb = round(db_size / 1024 / 1024, 2)
        
        return {
            "success": True,
            "version": version.split(',')[0],
            "tableCount": len(tables),
            "dbSize": f"{size_mb} MB",
            "uptime": "Active",
            "status": "online"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)