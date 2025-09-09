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
  type: 'transcript_update' | 'processing' | 'keepalive' | 'error' | 'transcript' | 'binary';
  speaker?: 'doctor' | 'patient';
  text?: string;
  timestamp?: string;
  session_id?: string;
  error?: string;
  is_final?: boolean;
  confidence?: number;
  data:string,
  isFinal:boolean
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

export interface PatientCreationTypes {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    ssn_last4?: string;
    address?: string;
}

export interface patient extends PatientCreationTypes{
  id: number;
  voice_enrolled: number;
}


export interface Session {
  session_id: number;
  doctor_id: number;
  patient_id: number;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'ended';
}

export interface Summary {
  summary_id: string;
  session_id: number;
  title?: string;
  content: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  final_content?: string;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SummaryData {
  success: boolean;
  session_id: number;
  summary_id: number;
  status: 'draft' | 'approved' | string; // Add more known statuses if applicable
  title: string;
  content: string;
  created_at: string;  // ISO 8601 date string
  approved_at: string | null;
  file_path: string | null;
   summary: Summary;
}

export interface TranscriptionSummary {
  message: string;
  session_id: number;
  summary_status: string;
  summary_id: number;
}


// Doctor related types
export interface doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  voice_enrolled: boolean;
}

export interface DoctorCreationTypes {
  first_name: string;
  last_name: string;
  email: string;
}

// API Response types
export interface CreateDoctorResponse {
  id: number;
  message: string;
  doctor: doctor;
}

export interface SearchDoctorsResponse {
  results: doctor[];
}

export interface UpdateDoctorResponse {
  message: string;
  doctor_id: number;
}