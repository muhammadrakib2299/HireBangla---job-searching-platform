import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const folder = (req.query.folder as string) || 'general';

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `hirebangla/${folder}`,
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error || !result) reject(error || new Error('Upload failed'));
              else resolve(result);
            },
          )
          .end(req.file!.buffer);
      },
    );

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadResumeFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'hirebangla/resumes',
              resource_type: 'raw',
            },
            (error, result) => {
              if (error || !result) reject(error || new Error('Upload failed'));
              else resolve(result);
            },
          )
          .end(req.file!.buffer);
      },
    );

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
}
