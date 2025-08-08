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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData)
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

static async SearchPatient(text:string | number | boolean): Promise<any> {
  try {
    const response = await fetch(`${API_SERVICE}/patients/search?query=${text}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
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
      body: JSON.stringify(patientData) 
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


  static async enrollPatientVoice(id:number, audioFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(`${API_SERVICE}/audio/enroll?patient_id=${id}`, {
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

}


