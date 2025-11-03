import {AuthStorage, MarkApiResponse, UserResponse} from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL;
const SCHOOL_TAPI = import.meta.env.VITE_LHU_TAPI;

export interface LoginRequestBody {
  DeviceInfo: string;
  UserID: string;
  Password: string;
  cf_verify_token: string;
}

export const authService = {
  async login(body: LoginRequestBody, turnstile_instance: any): Promise<void> {
    if (body.cf_verify_token === "") {
      throw new Error("Vui lòng hoàn thành bài kiểm tra bảo mật")
    }
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let msg = `Đăng nhập thất bại (${response.status})`;
      if ("reset" in turnstile_instance) {
        turnstile_instance.reset()
      }
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
      if (response.status === 401 ) {
        throw new Error("Phiên đã hết hạn, vui lòng đăng nhập lại")
      }
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
      } catch {

      }
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
  },
  async getMark(): Promise<MarkApiResponse | undefined> {
    const access_token = localStorage.getItem("access_token")
    if (!access_token) {
      throw new Error("Hãy đăng nhập để xem điểm của bạn")
    }
    try {
      const response = await fetch(`${SCHOOL_TAPI}/mark/MarkViewer_GetBangDiem`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${access_token}`
        },
      })
      const data: MarkApiResponse = await response.json()
      if (!response.ok) {
        if (response.status === 401 && response.statusText === "Token not found") {
          throw new Error("Phiên đã hết hạn, vui lòng đăng nhập lại")
        }
        if (response.status === 400 && data.Message === "Bạn chưa hoàn thành hết các đánh giá giáo viên và môn học") {
          throw new Error("Bạn chưa hoàn thành hết các đánh giá giáo viên và môn học")
        }
        if (response.status === 400 && data.Message === "Bạn không có quyền xem điểm") {
          throw new Error("Bạn không có quyền xem điểm")
        }
        throw new Error("Đã xảy ra lỗi, hãy xem trên app ME nhé bạn")
      }
      if (!data.data || Object.keys(data.data).length === 0) {
        throw new Error("Không tìm thấy điểm của mã sinh viên này")
      }
      return data
    } catch (error) {
      throw error;
    }
  }
};


