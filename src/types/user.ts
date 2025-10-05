export interface UserResponse {
  UserID: string;
  UserName: string;
  LastName: string;
  FirstName: string;
  DepartmentID: string;
  Email: string;
  EmailReceived: boolean;
  MessagePermission: number;
  FriendPermission: number;
  GroupID: number;
  Avatar: string;
  isAuth: boolean;
  FullName: string;
  GroupName: string;
  Class: string;
  DepartmentName: string;
}

export interface AuthState {
  user: UserResponse | null;
}

export interface MonHoc {
  ma_mon_hoc: string;
  ten_mon_hoc: string;
  he_so: string;
  diem_thanh_phan: string;
  diem_trung_binh: string;
}

export interface HocKyGroup {
  semesters: {
      [hocKy: string]: MonHoc[];
  };
  tin_chi_tich_luy: number;
  reason?: string;
}

export const AUTH_STORAGE_KEY = 'auth_user';

export const AuthStorage = {
  getUser(): UserResponse | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserResponse) : null;
    } catch {
      return null;
    }
  },
  setUser(user: UserResponse | null) {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
  isLoggedIn(): boolean {
    const user = this.getUser();
    const auth_token = localStorage.getItem("access_token");
    if (user && auth_token) return true;
    else return false;
  },
  deleteUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem("access_token")
  }
};


