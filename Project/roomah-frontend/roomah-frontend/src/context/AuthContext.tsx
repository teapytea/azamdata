// src/context/AuthContext.tsx (VERSI SUPABASE)
"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthError } from "@supabase/supabase-js";

// Definisikan tipe untuk data registrasi
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: any) => Promise<{ error: AuthError | null }>;
  register: (data: RegisterData) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  loginWithGoogle: (returnTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    // 1. Cek sesi aktif saat komponen pertama kali dimuat
    const getActiveSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getActiveSession();

    // 2. Dengarkan perubahan status otentikasi (login, logout, dll)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // Jika loading belum selesai, selesaikan sekarang
        if (isLoading) {
          setIsLoading(false);
        }
      }
    );

    // 3. Bersihkan listener saat komponen di-unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isLoading]);

  const login = async (credentials: any) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (!error) {
      router.push("/dashboard/cv-saya");
    }
    return { error };
  };

  const register = async (data: RegisterData) => {
    const { email, password, name } = data;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Simpan nama lengkap di metadata pengguna
        data: {
          full_name: name,
        },
      },
    });
    if (!error) {
      // Arahkan ke halaman onboarding untuk verifikasi setelah register
      router.push("/onboarding/verifikasi");
    }
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const loginWithGoogle = async (returnTo = "/dashboard") => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          location.origin
        }/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        queryParams: { access_type: "offline", prompt: "consent" },
        scopes: "email profile openid",
      },
    });
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    register,
    logout,
    isLoading,
    loginWithGoogle,
  };

  // Tampilkan loading screen global selagi mengecek sesi awal
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Loading application...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
