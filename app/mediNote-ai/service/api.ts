import { HealthResponse, patient, PatientCreationTypes, startConversationPayload } from "../types";
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
        throw new Error(`Health check failed: ${response.status}`);      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async enrollVoice(speakerType: 'doctors' | 'patients', audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(`https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/${speakerType}/register_voice`, {
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


// services/api.ts
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
        'Content-Type': 'application/json', // Add this header
      },
      body: JSON.stringify(data) // This is correct - fetch will handle it
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


static async registerPatient(patientData: PatientCreationTypes): Promise<any> {
  try {
    const response = await fetch(`${API_SERVICE}/patients/create`, {
      method: "POST",
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
      credentials: 'include',
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
          // Do not set 'Content-Type' header; browser will set it automatically for FormData
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


  static async enrollDoctorVoice(audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      const response = await fetch(`${API_SERVICE}/doctors/register_voice/0`, {
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

  static async startSession() {
    try {
      const response = await fetch(`${API_SERVICE}/session/start?doctor_id=1&patient_id=1`, {
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
      const response = await fetch(`${API_SERVICE}/summary/summary/save`, {
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
  static async getSummaryById(summaryId: number): Promise<any> {
    try {
      const response = await fetch(`${API_SERVICE}/summary/summary/get/${summaryId}`, {
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

  static async saveFinalSummary(data: { session_id: number; final_content: string; title: string }): Promise<any> {
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
        throw new Error(`Save final summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Save final summary error:', error);
      throw error;
    }
  }

  static async editSummary(data:{summaryId: number, edited_text: string}): Promise<any> {
    try {
      const url = `${API_SERVICE}/summary/summary/edit/${data?.summaryId}?edited_text=${encodeURIComponent(data.edited_text)}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'accept': 'application/json',
        },
        credentials: 'include',
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
  
}


