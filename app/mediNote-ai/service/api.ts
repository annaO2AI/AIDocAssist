import { HealthResponse, startConversationPayload } from "../types";
import { API_BASE_URL_AISEARCH_MediNote, API_ROUTES } from "../../constants/api";
import { PatientFormData } from "../components/PatientRegistration";
import { promises } from "dns";
// const API_BASE_URL = "https://doc-assistant-a9fafcdwb8gdh0fg.centralus-01.azurewebsites.net/";

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

  static async enrollVoice(speakerType: 'doctor' | 'patient', audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('role', speakerType);

      const response = await fetch(`${API_ROUTES.mediNote}`, {
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

static async registerPatient(patientData: PatientFormData): Promise<any> {
  try {
    const response = await fetch(`${API_ROUTES.registerPatient}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', // Add this header
      },
      body: JSON.stringify(patientData) // This is correct - fetch will handle it
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
}