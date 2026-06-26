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

// Функция для обработки одного файла
export async function processImage(file: Express.Multer.File): Promise<string> {
  const filename = `${uuidv4()}.webp`;

  // Добавили filename в конец пути!
  const outputPath = path.resolve(process.cwd(), "uploads/images", filename);

  await sharp(file.buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/images/${filename}`;
}

// Функция для удаления файла с диска
export async function deleteFileFromDisk(fileUrl: string) {
  try {
    // fileUrl выглядит как "/uploads/images/123.webp"
    const filePath = path.resolve(process.cwd(), fileUrl);
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Ошибка удаления файла ${fileUrl}:`, error);
  }
}
