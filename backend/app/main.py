import os
import json
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .db import get_db, Detection, create_tables
from .sagemaker_client import predict as sagemaker_predict

app = FastAPI(title="Car Detection Backend")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://wonderful-stone-048e14f03.7.azurestaticapps.net"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    create_tables()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/detect")
async def detect(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(400, "Podporované: JPEG, PNG, WEBP")

    img_bytes = await file.read()

    # Volanie AWS SageMaker (cross-cloud!)
    ai = sagemaker_predict(img_bytes, file.content_type)

    full_name = ai.get("top_prediction", "Unknown Unknown Unknown")
    parts = full_name.split()

    year = None
    brand = "Unknown"
    model_name = "Unknown"

    if parts:
        # 1. Skúsime vytiahnuť rok (ak je to posledný prvok a je to číslo)
        if parts[-1].isdigit() and len(parts[-1]) == 4:
            year = parts.pop() # Odstráni a vráti posledný prvok (rok)
        
        # 2. Prvé slovo berieme vždy ako značku (napr. Volkswagen, BMW, Aston)
        if parts:
            brand = parts[0]
            
        # 3. Všetko medzi značkou a rokom je model (napr. Golf GTI, 3 Series)
        if len(parts) > 1:
            model_name = " ".join(parts[1:])
        else:
            model_name = brand # Ak je tam len jedno slovo

    # Uloženie do DB (tvoj model Detection)
    d = Detection(
        top_prediction=full_name,
        confidence=ai.get("confidence", 0.0),
        top5_json=ai.get("top5"), 
        brand=brand,
        model_name=model_name,
        year=year
    )
    db.add(d)
    db.commit()
    db.refresh(d)

    return {
        "id": d.id,
        "top_prediction": d.top_prediction,
        "confidence": d.confidence,
        "top5": ai["top5"],
        "brand": brand,
        "year": year,
        "created_at": d.created_at.isoformat()
    }


@app.get("/api/history")
def history(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    items = db.query(Detection).order_by(Detection.created_at.desc()) \
        .offset(offset).limit(limit).all()
    total = db.query(Detection).count()
    return {
        "total": total,
        "items": [{
            "id": d.id,
            "top_prediction": d.top_prediction,
            "confidence": d.confidence,
            "brand": d.brand,
            "year": d.year,
            "created_at": d.created_at.isoformat()
        } for d in items]
    }


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):
    total = db.query(Detection).count()

    top_brands = db.execute(text("""
        SELECT brand, COUNT(*) AS c FROM detections
        WHERE brand IS NOT NULL AND brand != ''
        GROUP BY brand ORDER BY c DESC LIMIT 10
    """)).fetchall()

    top_models = db.execute(text("""
        SELECT top_prediction, COUNT(*) AS c FROM detections
        GROUP BY top_prediction ORDER BY c DESC LIMIT 10
    """)).fetchall()

    by_day = db.execute(text("""
        SELECT DATE(created_at) AS day, COUNT(*) AS c FROM detections
        WHERE created_at >= :start
        GROUP BY DATE(created_at) ORDER BY day
    """), {"start": datetime.utcnow() - timedelta(days=30)}).fetchall()

    return {
        "total_detections": total,
        "top_brands": [{"brand": r[0], "count": r[1]} for r in top_brands],
        "top_models": [{"model": r[0], "count": r[1]} for r in top_models],
        "detections_by_day": [{"day": str(r[0]), "count": r[1]} for r in by_day]
    }
