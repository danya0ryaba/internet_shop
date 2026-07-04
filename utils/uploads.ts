import multer from "multer";
import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Можно загружать только изображения!"));
  }
};

export const upload = multer({ storage, fileFilter });

export async function processImage(file: Express.Multer.File): Promise<string> {
  const filename = `${uuidv4()}.webp`;
  const outputPath = path.resolve(process.cwd(), "uploads/images", filename);

  await sharp(file.buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/images/${filename}`;
}

export async function deleteFileFromDisk(fileUrl: string) {
  try {
    const normalizedUrl = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const filePath = path.resolve(process.cwd(), normalizedUrl);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Ошибка удаления файла ${fileUrl}:`, error);
  }
}
