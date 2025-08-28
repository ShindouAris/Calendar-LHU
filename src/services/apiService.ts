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
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }
}