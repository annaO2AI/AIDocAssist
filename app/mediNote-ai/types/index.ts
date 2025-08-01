// Core API Response Types
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  details?: Record<string, any>;
}

// Audio and Enrollment Types
export interface EnrollmentRequest {
  speaker_type: 'doctor' | 'patient';
  audio_file: File;
}

export interface VoiceEnrollmentResponse {
  success: boolean;
  speaker_id: string;
  message?: string;
  enrollment_id?: string;
  audio_duration?: number;
}

// WebSocket/Real-time Types
export interface TranscriptMessage {
  type: 'transcript_update' | 'processing' | 'keepalive' | 'error';
  speaker?: 'doctor' | 'patient';
  text?: string;
  timestamp?: string;
  session_id?: string;
  error?: string;
  is_final?: boolean;
  confidence?: number;
}

export interface ConversationEntry {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  isFromBackend: boolean;
  confidence?: number;
}

// Patient Management Types
// Patient Management Types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  medical_record_number: string;
  created_at:string |Date;
  updated_at:string | null
}

export type CreatePatientData = Omit<Patient, 'id'>;
export type UpdatePatientData = Partial<CreatePatientData>;

// Conversation Management Types
export type ConversationStatus = 'active' | 'archived' | 'pending' | 'processed';

export interface Conversation {
  id: string;
  patient_id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  status: ConversationStatus;
  duration?: number;
  audio_file_url?: string;
}

// Summary Types
export interface Summary {
  id: string;
  conversation_id: string;
  summary_type: 'detailed' | 'brief' | 'soap';
  content: string;
  generated_by: string;
  created_at: string;
  updated_at?: string;
  model_version?: string;
}

// Audio Processing Types
export interface AudioUploadResponse {
  success: boolean;
  session_id: string;
  message?: string;
  transcript?: string;
  audio_duration?: number;
  word_count?: number;
  processing_time?: number;
}

// Error Types
export interface APIError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

// API Response Wrapper
export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface startConversation {
  conversation_id: string;
  session_id: string;
  patient: Patient;
  message: string;
}

export interface startConversationPayload{
  patient_id :string,
  title :string

}
