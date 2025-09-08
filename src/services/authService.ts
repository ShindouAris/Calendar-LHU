import { UserResponse } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginRequestBody {
  DeviceInfo: string;
  UserID: string;
  Password: string;
}

export const authService = {
  async login(body: LoginRequestBody): Promise<void> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let msg = `Đăng nhập thất bại (${response.status})`;
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await response.json();
          msg = data?.Message || data?.message || msg;
        } else {
          const text = await response.text();
          if (text) msg = text;
        }
      } catch {}
      throw new Error(msg);
    }
    const data = await response.json();
    localStorage.setItem("access_token", data.accessToken)
    localStorage.setItem("syncToken", data.syncToken)
  },

  async getUserInfo(): Promise<UserResponse> {
    const access_token = localStorage.getItem("access_token");
    const syncToken = localStorage.getItem("syncToken")
    if (!access_token) throw new Error('Chưa đăng nhập hoặc thiếu token');
    const response = await fetch(`${API_URL}/userinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: access_token,
        syncToken: syncToken
      })
    });
    if (!response.ok) {
      let msg = `Không lấy được thông tin người dùng (${response.status})`;
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await response.json();
          msg = data?.Message || data?.message || msg;
        } else {
          const text = await response.text();
          if (text) msg = text;
        }
      } catch {}
      throw new Error(msg);
    }
    return (await response.json()) as UserResponse;
  },
};


