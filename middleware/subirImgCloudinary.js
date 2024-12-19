import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Carpeta donde se guardarán las imágenes en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'] // Formatos permitidos
  }
});

const upload = multer({ storage });

export default upload;
