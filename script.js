class VoiceTranscriber {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        
        // DOM elements
        this.recordButton = document.getElementById('recordButton');
        this.stopButton = document.getElementById('stopButton');
        this.status = document.getElementById('status');
        this.transcriptionResult = document.getElementById('transcriptionResult');
        
        // Bind event listeners
        this.recordButton.addEventListener('click', () => this.startRecording());
        this.stopButton.addEventListener('click', () => this.stopRecording());
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Check if browser supports necessary APIs
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showError('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
                return;
            }
            
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            this.updateStatus('Ready to record');
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            if (error.name === 'NotAllowedError') {
                this.showError('Microphone access denied. Please allow microphone access and refresh the page.');
            } else {
                this.showError('Could not access microphone. Please check your microphone settings.');
            }
        }
    }
    
    async startRecording() {
        try {
            // Get audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            // Clear previous chunks
            this.audioChunks = [];
            
            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: this.getSupportedMimeType()
            });
            
            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Start recording
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            this.recordButton.disabled = true;
            this.recordButton.classList.add('recording');
            this.stopButton.disabled = false;
            this.updateStatus('Recording... Speak now', 'recording');
            this.clearTranscription();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Could not start recording. Please check your microphone permissions.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            this.recordButton.disabled = false;
            this.recordButton.classList.remove('recording');
            this.stopButton.disabled = true;
            this.updateStatus('Processing audio...', 'processing');
        }
    }
    
    async processRecording() {
        try {
            // Create blob from audio chunks
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.getSupportedMimeType() 
            });
            
            // Check if blob has data
            if (audioBlob.size === 0) {
                this.showError('No audio data recorded. Please try again.');
                this.updateStatus('Ready to record');
                return;
            }
            
            console.log('Audio blob size:', audioBlob.size, 'bytes');
            
            // Create form data
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            
            // Show loading indicator
            this.showLoading();
            
            // Send to server
            const response = await fetch('/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showTranscription(result.transcription);
                this.updateStatus('Transcription complete!');
            } else {
                let errorMessage = result.error || 'Failed to transcribe audio';
                
                // Provide more helpful error messages based on status code
                if (response.status === 429) {
                    errorMessage = '🚫 OpenAI quota exceeded. Please check your OpenAI billing and usage limits or try again later.';
                } else if (response.status === 401) {
                    errorMessage = '🔑 Invalid OpenAI API key. Please check your API configuration.';
                } else if (response.status === 400) {
                    errorMessage = '🎵 Audio format issue. Please try recording again with a clear voice.';
                } else if (response.status === 503) {
                    errorMessage = '🌐 Unable to connect to OpenAI. Please check your internet connection.';
                }
                
                this.showError(errorMessage);
                this.updateStatus('Ready to record');
            }
            
        } catch (error) {
            console.error('Error processing recording:', error);
            this.showError('Failed to process recording. Please check your internet connection and try again.');
            this.updateStatus('Ready to record');
        }
    }
    
    getSupportedMimeType() {
        // Check for supported audio formats
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];
        
        for (let type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log('Using mime type:', type);
                return type;
            }
        }
        
        // Fallback
        return 'audio/webm';
    }
    
    updateStatus(message, className = '') {
        this.status.textContent = message;
        this.status.className = 'status';
        if (className) {
            this.status.classList.add(className);
        }
    }
    
    showTranscription(text) {
        this.transcriptionResult.textContent = text || 'No speech detected';
        this.transcriptionResult.classList.remove('empty');
    }
    
    clearTranscription() {
        this.transcriptionResult.textContent = 'Your transcribed text will appear here...';
        this.transcriptionResult.classList.add('empty');
        this.hideError();
    }
    
    showLoading() {
        this.transcriptionResult.innerHTML = '<div class="loading"></div> Transcribing your speech...';
        this.transcriptionResult.classList.remove('empty');
    }
    
    showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        // Insert after status
        this.status.parentNode.insertBefore(errorDiv, this.status.nextSibling);
    }
    
    hideError() {
        const errorDiv = document.querySelector('.error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Initialize the voice transcriber when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceTranscriber();
});
