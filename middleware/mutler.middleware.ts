import multer from "multer";
import { uploadToCloudinary } from "../helpers/uploadToCloudinary.js";
import type { Request,Response,NextFunction } from "express"

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
    if(!file.mimetype.match(/\.(jpg|jpeg|png)$/)){
        return cb(new Error('Only image files (jpg,jpeg and png) are allowed!'));
    }   
    cb(null, true);

}
});
const uploadMiddleware = upload.single('image');
const handleImageUpload = (req: Request, res: Response,next : NextFunction) => {
    uploadMiddleware(req, res, async (err: any) => {
        if (err instanceof multer.MulterError || err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            if (result.success) {
               return res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { imageUrl: result.data?.secure_url } });
            } else {
                res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
            }
        } catch (uploadErr : any) {
            res.status(500).json({ success: false, message: uploadErr.message });
        }
    });
};



export default {handleImageUpload,uploadMiddleware};