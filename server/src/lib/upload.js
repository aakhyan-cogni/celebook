import path from "path";
import fs from "fs";
import multer from 'multer';

const imageFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

export const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = "public/uploads/avatars";
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${req.user.userId}-${Date.now()}${ext}`);
        },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: imageFilter,
});


export const eventImageUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = "public/uploads/events";
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const random = Math.random().toString(36).slice(2, 8);
            const eventId = req.params.id ?? "unknown";
            cb(null, `${eventId}-${Date.now()}-${random}${ext}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: imageFilter,
});
