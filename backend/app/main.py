import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.models.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    init_db()
    yield

app = FastAPI(
    title="Cryptographic Discovery - Enterprise Cryptographic Discovery & Analysis",
    description="Deterministic static cryptographic discovery, risk engine, potential exposure, and PQC migration analyzer for SIH 2026 Problem Statement SIH26164.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "tool": "Cryptographic Discovery",
        "subtitle": "Enterprise Cryptographic Discovery & Analysis",
        "status": "ONLINE",
        "api_docs": "/docs",
        "sih_problem_statement": "SIH26164"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "database": "sqlite_connected"
    }
