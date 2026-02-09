from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cloudinary_service import upload_image, delete_image

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_car_image(file: UploadFile = File(...)):
    """
    Uploads an image to Cloudinary and returns its URL and public_id.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    url, public_id = upload_image(file.file, folder="autopro/cars")
    
    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    return {"url": url, "image_id": public_id}

@router.delete("/{image_id}")
async def delete_car_image(image_id: str):
    """
    Deletes an image from Cloudinary by public_id.
    """
    success = delete_image(image_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete image")
    
    return {"status": "success"}
