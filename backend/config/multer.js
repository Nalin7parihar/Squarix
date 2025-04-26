import multer from 'multer';
import path from 'path';

// Multer configuration for temporary storage before uploading to Cloudinary
const storage = multer.memoryStorage(); // Store file in memory as buffer

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const extname = /jpeg|jpg|png|pdf/.test(path.extname(file.originalname).toLowerCase());

  if (allowedMimes.includes(file.mimetype) && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPG, PNG) and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export default upload;