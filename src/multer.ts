import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(process.cwd(), "data"));
    },
    filename: (req, file, callback) => {
        const filename = `${nanoid()}-${file.originalname.replace(" ", "_")}`;
        callback(null, filename);
    },
});

export const uploadFile = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, callback) => {
        callback(null, true);
    },
});
