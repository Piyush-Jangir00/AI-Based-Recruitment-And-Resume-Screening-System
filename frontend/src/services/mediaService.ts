// Media Service for Video/Audio Interview
// Handles webcam, microphone, speech recognition, and text-to-speech

export interface MediaState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  hasPermissions: boolean;
  error: string | null;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Check if browser supports required APIs
export const checkMediaSupport = (): { video: boolean; audio: boolean; speech: boolean; tts: boolean } => {
  return {
    video: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    audio: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    speech: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    tts: !!window.speechSynthesis
  };
};

// Request media permissions
export const requestMediaPermissions = async (
  video: boolean = true,
  audio: boolean = true
): Promise<MediaStream | null> => {
  try {
    const constraints: MediaStreamConstraints = {
      video: video ? { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } : false,
      audio: audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } : false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error('Media permission error:', error);
    return null;
  }
};

// Stop media stream
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};

// Toggle video track
export const toggleVideoTrack = (stream: MediaStream | null, enabled: boolean): void => {
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

// Toggle audio track
export const toggleAudioTrack = (stream: MediaStream | null, enabled: boolean): void => {
  if (stream) {
    stream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

// Speech Recognition Class
export class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private onResult: ((result: SpeechRecognitionResult) => void) | null = null;
  private onEnd: (() => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;
        
        if (this.onResult) {
          this.onResult({ transcript, confidence, isFinal });
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) {
          this.onEnd();
        }
      };
      
      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (this.onError) {
          this.onError(event.error);
        }
      };
    }
  }

  setOnResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResult = callback;
  }

  setOnEnd(callback: () => void): void {
    this.onEnd = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  start(): boolean {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return false;
    }
    
    if (!this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch (error) {
        console.error('Speech recognition start error:', error);
        return false;
      }
    }
    return true;
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// Text-to-Speech Service
export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private speaking: boolean = false;
  private onEnd: (() => void) | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoice();
  }

  private loadVoice(): void {
    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      // Prefer a natural-sounding English voice
      this.voice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
    };

    loadVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  setOnEnd(callback: () => void): void {
    this.onEnd = callback;
  }

  speak(text: string, rate: number = 1.0, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject('Text-to-speech not supported');
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (this.voice) {
        utterance.voice = this.voice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      utterance.onstart = () => {
        this.speaking = true;
      };

      utterance.onend = () => {
        this.speaking = false;
        if (this.onEnd) {
          this.onEnd();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        this.speaking = false;
        reject(event.error);
      };

      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.speaking = false;
    }
  }

  isSpeaking(): boolean {
    return this.speaking || this.synthesis.speaking;
  }

  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }
}

// Audio Visualization
export class AudioVisualizer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  connect(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    return sum / this.dataArray.length / 255; // 0-1 range
  }

  disconnect(): void {
    if (this.source) {
      this.source.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
  }
}

// Media Recorder for session recording
export class InterviewRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording: boolean = false;

  start(stream: MediaStream): boolean {
    try {
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Capture in 1-second chunks
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Recording error:', error);
      return false;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([]));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  isActive(): boolean {
    return this.isRecording;
  }
}

// Download recorded interview
export const downloadRecording = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
