import { ApiRequest, ApiResponse } from '@/types/schedule';

const API_ENDPOINT = 'https://tapi.lhu.edu.vn/calen/auth/XemLich_LichSinhVien';

export class ApiService {
  static async getSchedule(request: ApiRequest): Promise<ApiResponse> {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errorBody = await response.json().catch(() => null);
          const apiMessage = errorBody?.Message || errorBody?.message;
          if (apiMessage) {
            throw new Error(apiMessage);
          }
        } else {
          // Try text in case server returns text/plain for errors
          const text = await response.text().catch(() => '');
          if (text) {
            throw new Error(text);
          }
        }
      } catch (inner) {
        // If parsing the body or throwing above didn't happen, fall through to generic
        if (inner instanceof Error) {
          throw inner;
        }
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }
}