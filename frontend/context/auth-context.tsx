"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api/axiosInstance";

export type UserRole = "admin" | "tenant";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  roomNumber?: string;
  phone?: string;
  telegramId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  name?: string;
  phone?: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (backendUser: any): User => ({
  id: String(backendUser.user_id),
  username: backendUser.username,
  name:
    `${backendUser.first_name || ""} ${backendUser.last_name || ""}`.trim() ||
    backendUser.username,
  role: backendUser.role,
  email: backendUser.email,
  phone: backendUser.phone,
  roomNumber: backendUser.room_number,
  telegramId: backendUser.telegram_chat_id,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          const backendUser = res.data.data ?? res.data.user ?? res.data;
          setUser(mapUser(backendUser));
        } catch {
          localStorage.removeItem("token");
          setUser(null); 
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

const login = async (
  username: string,
  password: string,
  rememberMe: boolean,
) => {
  try {
    const res = await api.post("/auth/login", {
      username,
      password,
      rememberMe,
    });

    const payload = res.data.data;
    const token = payload?.token;
    const backendUser = payload?.user;

    if (!token) {
      return { success: false, error: "ไม่ได้รับ token จาก server" };
    }

    localStorage.setItem("token", token);

    let mappedUser: User;
    if (backendUser) {
      mappedUser = mapUser(backendUser);
    } else {
      const meRes = await api.get("/auth/me");
      const meUser = meRes.data.data ?? meRes.data.user ?? meRes.data;
      mappedUser = mapUser(meUser);
    }

    setUser(mappedUser);
    return { success: true, user: mappedUser };
  } catch (err: any) {
    const message =
      err.response?.data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่";
    return { success: false, error: message };
  }
};

  const register = async (data: RegisterData) => {
    try {
      await api.post("/auth/register", {
        username: data.username,
        password: data.password,
        name: data.name, // ✅ แก้ไข: เพิ่ม name
        email: data.email, // ✅ แก้ไข: เพิ่ม email
        phone: data.phone, // ✅ แก้ไข: เพิ่ม phone
        role: "tenant",
      });
      return { success: true };
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
