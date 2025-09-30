import { CreateDoctorResponse, DoctorCreationTypes, HealthResponse, patient, PatientCreationTypes, SearchDoctorsResponse, startConversationPayload, UpdateDoctorResponse } from "../types";
import { API_BASE_URL_AISEARCH_MediNote, API_ROUTES } from "../../constants/api";
import { promises } from "dns";
const API_SERVICE = "https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net"

export class APIService {
  static async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${API_ROUTES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response?.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async enrollVoice(speakerType: 'doctors' | 'patients', audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(`${API_SERVICE}/${speakerType}/register_voice`, {
        method: "POST",
        body: formData,
      });

      if (!response?.ok) {
        throw new Error(`Voice enrollment failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static generateSessionId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomString}`;
  }

  static async searchPatients(query: string): Promise<any> {
    try {
      const url = new URL(`${API_ROUTES.searchPatients}`);
      url.searchParams.append('query', query);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData)
      }
      return await response.json();
    } catch (error) {
      console.log('Search error:', error);
    }
  }

  static async startConversation(data:startConversationPayload): Promise<any>{
    try{
      const response = await fetch(`${API_BASE_URL_AISEARCH_MediNote}api/patients/${data?.patient_id}/start-conversation`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData)
      }

      return await response.json();
    }
    catch (error) {
      console.error('Registration error:', error);
    }
  }

  static async SearchDoctor(query: string): Promise<SearchDoctorsResponse> {
    try {
      const response = await fetch(`${API_SERVICE}/doctors/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching doctors:', error);
      throw error;
    }
  }

  static async updateDoctor(doctorData: DoctorCreationTypes, doctorId: number): Promise<UpdateDoctorResponse> {
    try {
      const response = await fetch(`${API_SERVICE}/doctors/update/${doctorId}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  }

  static async createDoctor(doctorData: DoctorCreationTypes): Promise<CreateDoctorResponse> {
    try {
      const response = await fetch(`${API_SERVICE}/doctors/create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  static async registerPatient(patientData: PatientCreationTypes): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/patients/create`, {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async SearchPatient(text:string | number | boolean): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/patients/search?query=${text}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData)
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  static async updatePatient(patientData: PatientCreationTypes, id:number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/patients/update/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(patientData) ,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData)
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  static async enrollPatientVoice(id: number, audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('speaker_id', id.toString());
      formData.append('role', 'patient');
      formData.append('file', audioFile);

      const response = await fetch(`${API_SERVICE}/audio/enroll`, {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response?.ok) {
        throw new Error(`Voice enrollment failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async enrollDoctorVoice(id: number, audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      const response = await fetch(`${API_SERVICE}/doctors/register_voice/${id}`, {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      if (!response?.ok) {
        throw new Error(`Doctor voice enrollment failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async checkPatientVoiceExists(patientId: number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/patients/voice_exists?patient_id=${patientId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Voice exists check error:', error);
    }
  }

  static async startSession(patientId: number, doctorId: number) {
    try {
      const response = await fetch(`${API_SERVICE}/session/start?doctor_id=${doctorId}&patient_id=${patientId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Session start failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Session start error:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string | number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/session/end?session_id=${sessionId}`, {
        method: "POST",
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Session end failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Session end error:', error);
      throw error;
    }
  }

  static async saveSummary(data: {
    doctor_id: number;
    patient_id: number;
    session_id: number;
    original_text: string;
    summary_text: string;
    edited_text?: string;
}): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/summary/summary/save`, {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Save summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Save summary error:', error);
      throw error;
    }
  }

  static async getSummary(sessionId: number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/summary/summary/getf/${sessionId}`, {
        method: "GET",
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Get summary failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  }

  static async getSummaryById(sessionId: number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/summary/summary/get/${sessionId}`, {
        method: "GET",
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Get summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  }

  static async saveFinalSummary(data: { session_id: number}): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/summary/summary/approve`, {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Save final summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Save final summary error:', error);
      throw error;
    }
  }

  static async editSummary(data: {summaryId: number, edited_text: string}): Promise<any> {
    try {
      const url = `${API_SERVICE}/summary/summary/summary/edit/${data.summaryId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          summary_text: data.edited_text || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Edit summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Edit summary error:', error);
      throw error;
    }
  }

  static async generateSummary(full_text: string): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/generate`, {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_text }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Summary generation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Summary generation error:', error);
      throw error;
    }
  }

  static async getTranscript(sessionId: number): Promise<any> {
    try {
      const response = await fetch(
        `${API_SERVICE}/session/transcript/${sessionId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Transcript fetch error data:', errorData);
        throw new Error(`Transcript fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Transcript fetch error:", error);
      throw error;
    }
  }

  static async getPatientHistory(patientId: number): Promise<any> {
    const response = await fetch(`${API_SERVICE}/patients/history/${patientId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      },
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async transcribeFromFile(formData:any): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/transcribe/from-file`, {
        method: "POST",
        body: formData,
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Transcription failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  static async downloadRecording(sessionId: string | number): Promise<{ blob: Blob, filename: string }> {
    try {
      const response = await fetch(
        `${API_SERVICE}/api/recordings/${sessionId}/download`,
        {
          method: 'GET',
          headers: {
            'accept': 'audio/wav',
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `session_${sessionId}_recording.wav`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      return { blob, filename }
    } catch (error) {
      console.error('Download recording error:', error)
      throw error
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('Response status:', response.status)
        console.log('Response headers:', Array.from(response.headers.entries()))
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  static async logout(): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/auth/logout`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(errorData);
        throw new Error(`Logout failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}