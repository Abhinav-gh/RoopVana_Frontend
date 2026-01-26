// Frontend API Client
// Place this in: frontend/src/services/api.ts

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
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this.baseURL}/api/speech-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this.baseURL}/api/generate/from-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Health check
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
   * Get supported languages
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
}

export const apiClient = new APIClient();
export default apiClient;