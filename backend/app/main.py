from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import os
import json
from datetime import datetime
from typing import List
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import requests

# NLP System Path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../ai-engine/nlp'))

try:
    from .prescription_generator import PrescriptionAI
    from .llama_prescription_generator import LlamaPrescriptionAI
    AI_AVAILABLE = True
    print("✅ AI system imported successfully")
except ImportError as e:
    print(f"⚠️  Could not import AI system: {e}")
    AI_AVAILABLE = False

# STT System Path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../ai-engine/stt'))

try:
    from .whisper_stt import transcribe_audio as transcribe_whisper
    STT_AVAILABLE = True
    print("🗣️  Whisper STT imported successfully")
except ImportError as e:
    print(f"⚠️  Could not import STT system: {e}")
    STT_AVAILABLE = False

from . import models, schemas, database
from .config import settings

# Import entity extractor and prescription generator
from .entity_extractor import extract_medical_entities

app = FastAPI(
    title="Medical AI MCP Server",
    description="AI-powered medical prescription system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_system = None

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    global ai_system
    
    database.create_tables()
    
    if AI_AVAILABLE:
        try:
            ai_system = PrescriptionAI(settings.OPENROUTER_API_KEY)
            print("🤖 AI system initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize AI system: {e}")
    
    print(f"🚀 Medical AI MCP Server started on {settings.HOST}:{settings.PORT}")

@app.get("/")
async def root():
    return {
        "message": "Medical AI MCP Server",
        "status": "online",
        "ai_available": AI_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_system": "online" if ai_system else "offline",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/patients", response_model=schemas.Patient)
async def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(database.get_db)
):
    existing = db.query(models.Patient).filter(models.Patient.id == patient.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient already exists")
    
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    return db_patient

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
async def get_patient(
    patient_id: str,
    db: Session = Depends(database.get_db)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.post("/appointments", response_model=schemas.Appointment)
async def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(database.get_db)
):
    db_appointment = models.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    print(f"📅 New appointment created: {db_appointment.id}")
    return db_appointment

@app.get("/doctor/{doctor_id}/appointments", response_model=List[schemas.Appointment])
async def get_doctor_appointments(
    doctor_id: str,
    db: Session = Depends(database.get_db)
):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id
    ).all()
    
    return appointments

@app.post("/prescription/suggest")
async def suggest_prescription(request: schemas.PrescriptionRequest):
    if not ai_system:
        raise HTTPException(
            status_code=503, 
            detail="AI system not available. Please check configuration."
        )
    
    try:
        patient_info = {
            "age": request.age,
            "gender": request.gender,
            "symptoms": request.symptoms,
            "medical_history": request.medical_history or [],
            "allergies": request.allergies or []
        }
        
        result = ai_system.suggest_prescription(patient_info)
        
        return {
            "status": "success",
            "patient_info": patient_info,
            "ai_result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI assessment failed: {str(e)}"
        )

@app.post("/prescription/submit")
async def submit_prescription(
    prescription: schemas.PrescriptionSubmit,
    db: Session = Depends(database.get_db)
):
    db_prescription = models.Prescription(**prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    print(f"💊 Prescription submitted: {db_prescription.id}")
    
    return {
        "status": "prescription_saved",
        "prescription_id": db_prescription.id,
        "timestamp": datetime.now().isoformat()
    }

# === VOICE PROCESSING ENDPOINTS ===
@app.post("/voice/upload")
async def upload_voice(audio: UploadFile = File(...)):
    """Upload and transcribe voice using Whisper STT"""
    if not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be audio format")

    temp_audio_path = f"temp_{audio.filename}"
    with open(temp_audio_path, "wb") as f:
        f.write(await audio.read())

    try:
        if not STT_AVAILABLE:
            raise Exception("Whisper STT not available")
        
        transcript = transcribe_whisper(temp_audio_path)

        # You can optionally call an NLP extraction method here later
        return {
            "status": "transcribed",
            "filename": audio.filename,
            "transcript": transcript,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.remove(temp_audio_path)

@app.post("/voice/to-prescription")
async def voice_to_prescription(
    audio: UploadFile = File(...),
    age: int = 25,
    gender: str = "Unknown"
):
    voice_result = await upload_voice(audio)
    
    if voice_result["status"] != "transcribed":
        return voice_result
    
    # Dummy symptom extraction until you plug in NLP
    symptoms = ["fever", "headache"]

    prescription_request = schemas.PrescriptionRequest(
        age=age,
        gender=gender,
        symptoms=symptoms
    )
    
    ai_result = await suggest_prescription(prescription_request)
    
    return {
        "voice_processing": voice_result,
        "ai_prescription": ai_result,
        "pipeline_status": "complete"
    }

@app.get("/test/ai")
async def test_ai_system():
    if not ai_system:
        return {"error": "AI system not available"}
    
    test_patient = {
        "age": 30,
        "gender": "Female",
        "symptoms": ["fever", "cough", "fatigue"]
    }
    
    try:
        result = ai_system.suggest_prescription(test_patient)
        return {
            "test_status": "success",
            "test_patient": test_patient,
            "ai_response": result
        }
    except Exception as e:
        return {
            "test_status": "failed",
            "error": str(e)
        }

@app.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    # Load Replicate API token from environment
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        return JSONResponse({"error": "Replicate API token not configured. Please set REPLICATE_API_TOKEN in your .env."}, status_code=500)

    # Save uploaded file temporarily
    temp_audio_path = f"temp_{file.filename}"
    with open(temp_audio_path, "wb") as f:
        f.write(await file.read())

    try:
        # Upload file to file.io
        with open(temp_audio_path, "rb") as audio_file:
            file_io_resp = requests.post("https://file.io", files={"file": audio_file})
        if file_io_resp.status_code != 200:
            return JSONResponse({"error": f"Failed to upload file to file.io: {file_io_resp.text}"}, status_code=500)
        file_io_data = file_io_resp.json()
        file_url = file_io_data.get("link") or file_io_data.get("url")
        if not file_url:
            return JSONResponse({"error": "file.io did not return a file URL."}, status_code=500)

        # Prepare Replicate API request
        replicate_api_url = "https://api.replicate.com/v1/predictions"
        model_version = "4c07ae671e5bfddcfce315f0dca3dff0be3b610e8e3785f90c2ab2224ecf33ba"
        headers = {
            "Authorization": f"Token {replicate_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "version": model_version,
            "input": {
                "audio": file_url
            }
        }
        replicate_resp = requests.post(replicate_api_url, headers=headers, json=payload)
        if replicate_resp.status_code != 201:
            return JSONResponse({"error": f"Replicate API error: {replicate_resp.text}"}, status_code=500)
        replicate_data = replicate_resp.json()
        # The Replicate API is async, so we need to poll for completion
        prediction_url = replicate_data.get("urls", {}).get("get")
        if not prediction_url:
            return JSONResponse({"error": "Replicate did not return a prediction URL."}, status_code=500)
        # Poll for result
        import time
        for _ in range(60):  # up to ~60 seconds
            poll_resp = requests.get(prediction_url, headers=headers)
            poll_data = poll_resp.json()
            status = poll_data.get("status")
            if status == "succeeded":
                transcription = poll_data.get("output")
                return JSONResponse({"transcript": transcription})
            elif status == "failed":
                return JSONResponse({"error": "Replicate prediction failed."}, status_code=500)
            time.sleep(1)
        return JSONResponse({"error": "Replicate prediction timed out."}, status_code=504)
    except Exception as e:
        return JSONResponse({"error": f"Transcription failed: {str(e)}"}, status_code=500)
    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

@app.post("/prescription/ai-assessment")
async def ai_medical_assessment(
    data: dict = Body(...)
):
    transcript = data.get("transcript", "")
    if not transcript:
        return JSONResponse({"error": "Transcript is required"}, status_code=400)
    # Extract entities
    entities = extract_medical_entities(transcript)
    # Use default values if not found
    age = entities.get("age") or 30
    gender = entities.get("gender") or "unknown"
    symptoms = entities.get("symptoms") or [transcript]
    # Generate prescription
    ai = PrescriptionAI(api_key=PrescriptionAI.API_KEY if hasattr(PrescriptionAI, 'API_KEY') else "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")
    result = ai.suggest_prescription({
        "age": age,
        "gender": gender,
        "symptoms": symptoms
    })
    return JSONResponse({
        "entities": entities,
        "prescription": result
    })

@app.post("/ai/prescription")
async def generate_prescription_with_llama(data: dict = Body(...)):
    """Generate prescription using OpenRouter API with Llama model"""
    transcript = data.get("transcript", "")
    
    # Debug: Log what we received
    print(f"🔍 Backend received transcript: '{transcript}'")
    print(f"📏 Transcript length: {len(transcript)}")
    
    if not transcript:
        return JSONResponse({"error": "Transcript is required"}, status_code=400)
    
    try:
        # Use existing OpenRouter API key from settings
        openrouter_api_key = settings.OPENROUTER_API_KEY
        
        if not openrouter_api_key or openrouter_api_key == "YOUR_OPENROUTER_API_KEY":
            return JSONResponse({
                "error": "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment."
            }, status_code=500)
        
        # Initialize Llama prescription AI with OpenRouter
        llama_ai = LlamaPrescriptionAI(openrouter_api_key)
        
        # Generate prescription
        result = llama_ai.generate_prescription(transcript)
        
        return JSONResponse({
            "status": "success",
            "prescription_data": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error generating prescription: {str(e)}")
        return JSONResponse({
            "error": f"Failed to generate prescription: {str(e)}"
        }, status_code=500)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"❌ Unhandled exception: {exc}")
    return HTTPException(
        status_code=500,
        detail=f"Internal server error: {str(exc)}"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.DEBUG
    )
