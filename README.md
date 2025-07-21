# AI Voice Transcription App

A real-time voice transcription website built with Node.js, Express.js, and OpenAI's Whisper API. Users can record their voice directly in the browser, and the app will transcribe the audio using AI.

## Features

- 🎤 Real-time voice recording in the browser
- 🤖 AI-powered transcription using OpenAI Whisper
- 🎨 Modern, responsive web interface
- 🚀 Fast and accurate speech-to-text conversion
- 🔒 Secure file handling with automatic cleanup
- 📱 Mobile-friendly design

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OpenAI API key

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd voice-transcription-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Open the `.env` file
   - Replace `your_openai_api_key_here` with your actual OpenAI API key:
     ```
     OPENAI_API_KEY=sk-your-actual-api-key-here
     ```

## Getting Your OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

3. **Use the application:**
   - Click "Start Recording" to begin recording your voice
   - Speak clearly into your microphone
   - Click "Stop Recording" when finished
   - Wait for the AI to transcribe your speech
   - View the transcription result on the screen

## Project Structure

```
voice-transcription-app/
├── server.js              # Express server with API endpoints
├── package.json           # Node.js dependencies and scripts
├── .env                   # Environment variables (API keys)
├── README.md             # Project documentation
├── public/               # Static files served to browser
│   ├── index.html        # Main HTML page
│   └── script.js         # Client-side JavaScript
└── uploads/              # Temporary folder for audio files (auto-created)
```

## How It Works

1. **Frontend Recording:** The browser's MediaRecorder API captures audio from the user's microphone
2. **File Upload:** The recorded audio is sent to the server as a file
3. **AI Processing:** The server sends the audio to OpenAI's Whisper API for transcription
4. **Results Display:** The transcribed text is returned and displayed to the user
5. **Cleanup:** Temporary audio files are automatically deleted after processing

## API Endpoints

- `GET /` - Serves the main HTML page
- `POST /transcribe` - Accepts audio file and returns transcription
- `GET /health` - Health check endpoint

## Browser Compatibility

This app works best with modern browsers that support:
- MediaRecorder API
- getUserMedia API
- Fetch API

Recommended browsers:
- Chrome 60+
- Firefox 65+
- Safari 14+
- Edge 79+

## Troubleshooting

**Microphone Access Issues:**
- Make sure you allow microphone access when prompted
- Check your browser's privacy settings
- Ensure your microphone is working and not used by other applications

**API Issues:**
- Verify your OpenAI API key is correct
- Check that you have sufficient credits in your OpenAI account
- Ensure your internet connection is stable

**Recording Issues:**
- Try using a different browser
- Check that your microphone is the default recording device
- Ensure no other applications are using the microphone

## Security Notes

- Audio files are temporarily stored on the server and automatically deleted after processing
- The OpenAI API key is stored server-side and never exposed to the client
- CORS is enabled for development; configure appropriately for production

## License

ISC License - See package.json for details

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.
