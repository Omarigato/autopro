from fastapi import APIRouter, UploadFile, File, Request
from app.services.cloudinary_service import CloudinaryService
from app.core.responses import create_response

router = APIRouter()

@router.post("/upload")
async def upload_car_image(request: Request, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return create_response(code=400, message="File must be an image", lang=request.state.lang)

    url, public_id = CloudinaryService.upload_image(file.file, folder="autopro/cars")
    if not url:
        return create_response(code=500, message="Upload failed", lang=request.state.lang)
    
    return create_response(data={"url": url, "image_id": public_id}, lang=request.state.lang)

@router.delete("/{image_id}")
async def delete_car_image(request: Request, image_id: str):
    success = CloudinaryService.delete_image(image_id)
    if not success:
        return create_response(code=400, message="Delete failed", lang=request.state.lang)
    
    return create_response(message="Deleted", lang=request.state.lang)
