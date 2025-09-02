import { ApiRequest, ApiResponse } from '@/types/schedule';
import { ForecastDay, HourForecast, WeatherCurrentAPIResponse, WeatherForeCastAPIResponse } from '@/types/weather';

// const API_ENDPOINT = 'https://tapi.lhu.edu.vn/calen/auth/XemLich_LichSinhVien';
const API_ENDPOINT = 'http://localhost:3000'

export class ApiService {
  static async getSchedule(request: ApiRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_ENDPOINT}/schedule/${request.StudentID}`, {
      method: 'GET',
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
  };
  static async get_current_weather(): Promise<WeatherCurrentAPIResponse> {
    const response = await fetch(`${API_ENDPOINT}/weather/current`, {
      method: 'GET',
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

  static async get_forecast_weather(scheduletime: string | null = null): Promise<HourForecast> {

    const toUnixSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

    const timestamp = scheduletime
      ? toUnixSeconds(new Date(scheduletime))
      : toUnixSeconds(new Date());

    const response = await fetch(`${API_ENDPOINT}/weather/forecast?timestamp=${timestamp}`, {
      method: 'GET',
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
  
  static async get_3_day_forecast_weather(): Promise<WeatherForeCastAPIResponse> {
    const response = await fetch(`${API_ENDPOINT}/weather/forecast_all`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return await response.json();
  }

  
}