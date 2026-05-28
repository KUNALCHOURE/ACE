import express from 'express';
import { chat, uploadImage, analyzeImage } from '../controllers/chatController.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { verifyjwt } from '../middlewares/authmiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 20 messages per hour, keyed per user (or IP if anonymous)
const chatLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString?.() || req.ip,
    message: {
        error: 'You have hit the chat limit of 20 messages per hour. Please try again later.'
    }
});

// Chat endpoint — auth-gated and rate-limited
router.post('/chat', verifyjwt, chatLimiter, chat);

// Image upload endpoint
router.post('/upload-image', upload.single('image'), uploadImage);

// Image analysis endpoint
router.post('/analyze-image', analyzeImage);

export default router;
