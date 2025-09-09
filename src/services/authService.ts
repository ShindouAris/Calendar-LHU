import { AuthStorage, UserResponse } from '@/types/user';

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
  },

  async getUserInfo(): Promise<UserResponse> {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) throw new Error('Chưa đăng nhập hoặc thiếu token');
    const response = await fetch(`${API_URL}/userinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: access_token
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
  async logOut(): Promise<string | null> {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      throw new Error("Chưa đăng nhập lấy gì đăng xuất 😭❌?")
    }
    const response = await fetch(
      `${API_URL}/logout`,
      {
        method: "POST", 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "accessToken": access_token
        })
      }
    )
    if (!response.ok) {
      localStorage.removeItem("access_token")
      throw new Error("Đăng xuất thất bại, hãy đăng xuất thủ công qua app ME")
    }
    AuthStorage.deleteUser()
    localStorage.removeItem("access_token")
    return "Đăng xuất thành công" 
  }
};


