export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface EnrollmentRequest {
  speaker_type: 'doctor' | 'patient';
  audio_file: File;
}

export interface TranscriptMessage {
  type: 'transcript_update' | 'processing' | 'keepalive' | 'error';
  speaker?: 'doctor' | 'patient';
  text?: string;
  timestamp?: string;
  session_id?: string;
  error?: string;
}

export interface ConversationEntry {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  isFromBackend: boolean;
}