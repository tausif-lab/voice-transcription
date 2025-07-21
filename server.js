const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Simple rate limiting to prevent API abuse
const rateLimitMap = new Map();

function rateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
        return next();
    }
    
    const clientData = rateLimitMap.get(clientIP);
    
    if (now > clientData.resetTime) {
        // Reset window
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
        return next();
    }
    
    if (clientData.count >= maxRequests) {
        return res.status(429).json({
            error: 'Too many requests. Please wait before trying again.',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
    }
    
    clientData.count++;
    next();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true); // For rate limiting

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        cb(null, `audio-${timestamp}.wav`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only audio files
        if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.wav') || file.originalname.endsWith('.mp3') || file.originalname.endsWith('.m4a')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit (OpenAI's limit)
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Transcription endpoint with rate limiting
app.post('/transcribe', rateLimit, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        console.log('Processing audio file:', req.file.filename);

        // Create readable stream from uploaded file
        const audioStream = fs.createReadStream(req.file.path);

        // Call OpenAI Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: audioStream,
            model: 'whisper-1',
            language: 'en', // You can make this dynamic or auto-detect
            response_format: 'json'
        });

        console.log('Transcription successful:', transcription.text);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return transcription result
        res.json({ 
            success: true, 
            transcription: transcription.text 
        });

    } catch (error) {
        console.error('Transcription error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Handle different types of OpenAI errors
        let errorMessage = 'Failed to transcribe audio';
        let statusCode = 500;

        if (error.status === 429) {
            errorMessage = 'OpenAI quota exceeded. Please check your OpenAI billing and usage limits.';
            statusCode = 429;
        } else if (error.status === 401) {
            errorMessage = 'Invalid OpenAI API key. Please check your API key configuration.';
            statusCode = 401;
        } else if (error.status === 400) {
            errorMessage = 'Invalid audio format or request. Please try recording again.';
            statusCode = 400;
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = 'Unable to connect to OpenAI API. Please check your internet connection.';
            statusCode = 503;
        }

        res.status(statusCode).json({ 
            error: errorMessage, 
            details: error.message,
            code: error.code || 'unknown'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API key validation endpoint
app.get('/validate-api', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ 
                valid: false, 
                error: 'No OpenAI API key configured' 
            });
        }

        if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
            return res.status(400).json({ 
                valid: false, 
                error: 'Invalid API key format' 
            });
        }

        // Try a simple API call to validate the key
        const models = await openai.models.list();
        res.json({ 
            valid: true, 
            message: 'OpenAI API key is valid',
            modelCount: models.data.length
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            valid: false, 
            error: error.message,
            status: error.status
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Voice Transcription Server running on http://localhost:${PORT}`);
    console.log('Make sure to set your OPENAI_API_KEY in the .env file');
});
