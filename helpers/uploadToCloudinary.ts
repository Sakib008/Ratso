import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier"
import type { ApiResponse } from "../Types/apiResponse.js";

const uploadToCloudinary = (buffer: Buffer): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'store-images' },
            (error, result) => {
                if (error) return reject(error);
                resolve({success: true,message: "Upload Stream on cloudinary", data: result } as ApiResponse);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export { uploadToCloudinary};

