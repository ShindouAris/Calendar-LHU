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
    return !!this.getUser();
  },
  deleteUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
};


