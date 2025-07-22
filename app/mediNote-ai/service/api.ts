import { HealthResponse } from "../types";
import { API_ROUTES } from "../../constants/api";
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
        throw new Error(`Health check failed: ${response.status}`);
      }
      console.log(response.json, '111111')
      return await response.json();
    } catch (error) {
      console.log('Health check error:', error);
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
      console.log('Voice enrollment error:', error);
      throw error;
    }
  }

  static generateSessionId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomString}`;
  }
}