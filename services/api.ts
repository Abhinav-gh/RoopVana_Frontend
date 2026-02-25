// Frontend API Client
// Sends Firebase ID token with every authenticated request

import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface GenerateImageRequest {
  prompt: string;
  language: string;
  style?: 'traditional' | 'modern' | 'fusion' | 'bridal' | 'casual';
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  imageData?: string;
  prompt: string;
  generationTime: number;
  language: string;
  error?: string;
  remainingGenerations?: number;
}

export interface SpeechToTextRequest {
  audioData: string;
  languageCode: string;
}

export interface SpeechToTextResponse {
  success: boolean;
  text?: string;
  language: string;
  confidence?: number;
  error?: string;
}

export interface GenerateFromImageRequest {
  imageData: string;
  textPrompt?: string;
  style?: string;
}

export interface GenerateFromImageResponse {
  success: boolean;
  imageUrl?: string;
  generationTime: number;
  error?: string;
  remainingGenerations?: number;
}

export interface UserQuotaResponse {
  success: boolean;
  generationsToday: number;
  remainingGenerations: number;
  maxGenerations: number;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get the current Firebase ID token for the authenticated user.
   * Returns null if no user is logged in.
   */
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  /**
   * Build headers with auth token
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Error (generateImage):', error);
      throw error;
    }
  }

  /**
   * Convert speech to text
   */
  async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/speech-to-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert speech to text');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Error (speechToText):', error);
      throw error;
    }
  }

  /**
   * Generate image from reference image + optional text
   */
  async generateFromImage(request: GenerateFromImageRequest): Promise<GenerateFromImageResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/generate/from-image`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Error (generateFromImage):', error);
      throw error;
    }
  }

  /**
   * Health check (no auth required)
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return await response.json();
    } catch (error: any) {
      console.error('API Error (healthCheck):', error);
      throw error;
    }
  }

  /**
   * Get supported languages (no auth required)
   */
  async getLanguages(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/languages`);
      return await response.json();
    } catch (error: any) {
      console.error('API Error (getLanguages):', error);
      throw error;
    }
  }

  /**
   * Get the current user's generation quota
   */
  async getUserQuota(): Promise<UserQuotaResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/api/user/quota`, {
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user quota');
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Error (getUserQuota):', error);
      throw error;
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;