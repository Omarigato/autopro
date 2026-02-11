import cloudinary
import cloudinary.uploader
from app.core.config import settings

# Initialize Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

class CloudinaryService:
    @staticmethod
    def upload_image(file_obj, folder: str = "autopro/cars") -> tuple[str, str] | tuple[None, None]:
        """
        Uploads a file-like object to Cloudinary.
        Returns (url, public_id) or (None, None) on failure.
        """
        try:
            response = cloudinary.uploader.upload(file_obj, folder=folder)
            return response.get("secure_url"), response.get("public_id")
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            return None, None

    @staticmethod
    def delete_image(public_id: str) -> bool:
        """
        Deletes an image from Cloudinary by its public_id.
        """
        if not public_id:
            return False
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            print(f"Cloudinary delete error: {e}")
            return False
