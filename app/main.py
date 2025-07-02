from fastapi import FastAPI
from app.api.api import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GeekBlog API", version="0.1.0", openapi_url="/api/v1/openapi.json")

# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost",
    "http://localhost:3000", # Assuming React frontend runs on port 3000
    "http://localhost:5173", # Default Vite port
    # Add any other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["healthcheck"])
async def health_check():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api/v1")

# Optional: A root path message if you still want one
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to GeekBlog API. Docs at /docs or /redoc"}
