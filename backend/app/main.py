from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app.core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event Management Platform API",
    description="API for managing events, users, and registrations.",
    version="1.0.0",
)

origins = [
    "http://localhost:5173",  # React default port
    "http://localhost:3000",
]

import logging
import time

# Setup logging
logging.basicConfig(filename='api.log', level=logging.INFO, format='%(asctime)s - %(message)s')

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logging.info(f"{request.client.host} - \"{request.method} {request.url.path}\" {response.status_code} - {process_time:.4f}s")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Event Management Platform API"}
