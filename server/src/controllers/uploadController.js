import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import AppError from '../utils/AppError.js';

export function configureCloudinary() {
  if (process.env.CLOUDINARY_CLOUD_NAME) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
}

const localUpload = async req => {
  const folder = String(req.body.folder || 'general').replace(/[^a-z0-9-]/gi, '') || 'general';
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[req.file.mimetype] || 'img';
  const relative = path.posix.join(folder, `${Date.now()}-${randomUUID()}.${extension}`);
  const root = path.resolve(process.cwd(), 'uploads');
  await mkdir(path.join(root, folder), { recursive: true });
  await writeFile(path.join(root, ...relative.split('/')), req.file.buffer);
  const origin = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;
  return { url: `${origin}/uploads/${relative}`, publicId: `local/${relative}`, format: extension, alt: req.body.alt || '', storage: 'local' };
};

export async function upload(req, res) {
  if (!req.file) throw new AppError('Select an image to upload', 400);
  const folder = `flaash/${req.body.folder || 'general'}`;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const data = await localUpload(req);
    return res.status(201).json({ success: true, message: 'Cloudinary is not configured. The image was stored locally for development.', data });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, value) => error ? reject(error) : resolve(value));
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    return res.status(201).json({ success: true, data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, alt: req.body.alt || '', storage: 'cloudinary' } });
  } catch (error) {
    console.error('Cloudinary upload failed:', error?.http_code || error?.error?.http_code || error?.message);
    const data = await localUpload(req);
    return res.status(201).json({ success: true, message: 'Cloudinary could not be reached. The image was stored locally for development.', data });
  }
}
