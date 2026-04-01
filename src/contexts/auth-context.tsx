
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User, OwnerProfile, ProfileStatus, FormSchema } from '@/lib/types';

const apiPath = process.env.NEXT_PUBLIC_API_PATH;

interface AuthContextType {
  user: User | null;
  profile: OwnerProfile | null;
  profileStatus: ProfileStatus | null;
  accessToken: string | null;
  formConfig: FormSchema | null;
  isLoading: boolean;
  logout: () => void;
  fetchProfile: () => Promise<any>;
  fetchFormConfig: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  login: (data: any) => Promise<any>;
  signup: (data: any) => Promise<any>;
  forgotPassword: (data: any) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  verifyOtp: (data: any) => Promise<any>;
  resendOtp: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'];

const getPathWithoutQuery = (path: string) => path.split('?')[0];

const isCurrentPagePublic = (pathname: string) => {
  const basePage = getPathWithoutQuery(pathname);
  return PUBLIC_PATHS.includes(basePage);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [formConfig, setFormConfig] = useState<FormSchema | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    setUser(null);
    setProfile(null);
    setProfileStatus(null);
    setFormConfig(null);
    setAccessToken(null);
    setRefreshToken(null);

    const basePage = getPathWithoutQuery(pathname);
    if (!PUBLIC_PATHS.includes(basePage)) {
        router.push('/login');
    }
  }, [router, pathname]);

  const fetchPublic = useCallback(async (url: string, options: RequestInit = {}) => {
    const fullUrl = `${apiPath}${url}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(fullUrl, { ...options, headers });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      throw new Error("Le serveur n’a pas répondu correctement.");
    }

    if (!response.ok) {
      const error: any = new Error(responseData.error || responseData.detail || 'Une erreur est survenue.');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  }, []);

  const tryRefreshToken = useCallback(async (currentRefreshToken: string) => {
    const refreshUrl = `/api/token/refresh/`;
    try {
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });

      if (!response.ok) {
          throw new Error('Session expirée');
      }

      const data = await response.json();
      const newAccessToken = data.access;
      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;

    } catch (e) {
      logout();
      return null;
    }
  }, [logout]);
  
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = accessToken;
    if (!token) {
        token = localStorage.getItem('accessToken');
        if (!token) {
          logout();
          throw new Error('Non authentifié');
        }
        setAccessToken(token);
    }

    const fullUrl = url.startsWith('http') ? url : `${apiPath}${url}`;
    const customHeaders = new Headers(options.headers || {});
    customHeaders.set('Authorization', `Bearer ${token}`);
    if (!customHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
        customHeaders.set('Content-Type', 'application/json');
    }

    let response = await fetch(fullUrl, { ...options, headers: customHeaders });

    if (response.status === 401) {
        const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');
        if (!currentRefreshToken) {
          logout();
          throw new Error('Session expirée');
        }
        const newAccessToken = await tryRefreshToken(currentRefreshToken);
        if (newAccessToken) {
            customHeaders.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(fullUrl, { ...options, headers: customHeaders });
        } else {
             throw new Error('Session expirée');
        }
    }
    
    return response;
  }, [accessToken, refreshToken, logout, tryRefreshToken]);

  const login = useCallback(async (data: any) => {
    const responseData = await fetchPublic('/accounts/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('accessToken', responseData.access);
    localStorage.setItem('refreshToken', responseData.refresh);
    window.location.href = responseData.redirect || '/dashboard';
    return responseData;
  }, [fetchPublic]);

  const signup = useCallback(async (data: any) => {
    const responseData = await fetchPublic('/accounts/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (responseData.user_id) {
        sessionStorage.setItem('user_id_for_verification', responseData.user_id);
    }
    return responseData;
  }, [fetchPublic]);

  const verifyOtp = useCallback(async (data: any) => {
    const responseData = await fetchPublic('/accounts/auth/verify/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    localStorage.setItem('accessToken', responseData.access);
    localStorage.setItem('refreshToken', responseData.refresh);
    sessionStorage.removeItem('user_id_for_verification');
    window.location.href = responseData.redirect || '/onboarding'; // Correction: Rediriger vers onboarding
    return responseData;
  }, [fetchPublic]);

  const forgotPassword = useCallback(async (data: any) => {
    return fetchPublic('/accounts/auth/forgot_password/', { method: 'POST', body: JSON.stringify(data) });
  }, [fetchPublic]);

  const resetPassword = useCallback(async (data: any) => {
    return fetchPublic('/accounts/auth/reset_password/', { method: 'POST', body: JSON.stringify(data) });
  }, [fetchPublic]);

  const resendOtp = useCallback(async (data: any) => {
    return fetchPublic('/accounts/auth/resend_code/', { method: 'POST', body: JSON.stringify(data) });
  }, [fetchPublic]);

 const fetchProfile = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/accounts/profile/me/');
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ detail: 'Impossible de lire la réponse d\'erreur' }));
         throw new Error(errorData.detail || 'Impossible de charger le profil');
      }
      const data = await response.json();
      setUser(data.user);
      setProfile(data.profile);
      setProfileStatus(data.profile_status);
      return data.profile_status;
    } catch (error) {
      console.error("Fetch profile error:", error);
      throw error;
    }
  }, [fetchWithAuth]);
  
  const fetchFormConfig = useCallback(async () => {
    try {
        const response = await fetchWithAuth('/schema/config/');
        const data = await response.json();
        setFormConfig(data);
    } catch (error) {
        console.error("Fetch form config error:", error);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Si on est sur une page publique et qu'on a pas de tokens, on ne fait rien.
      if (isCurrentPagePublic(pathname) && !localStorage.getItem('accessToken')) {
          setIsLoading(false);
          return;
      }
      
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && storedRefreshToken) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        try {
          const status = await fetchProfile();
          const currentPageIsPublic = isCurrentPagePublic(pathname);

          if (status.pass_onboading) {
            if (currentPageIsPublic || getPathWithoutQuery(pathname) === '/onboarding') {
              router.push('/dashboard');
            }
          } else {
            if (getPathWithoutQuery(pathname) !== '/onboarding' && !currentPageIsPublic) {
              router.push('/onboarding');
            }
          }
        } catch (error) {
            logout(); 
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  // LA CORRECTION CRUCIALE : Ajout de `pathname` aux dépendances
  }, [pathname, router, logout, fetchProfile]); 

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && !user && !isCurrentPagePublic(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
        user, 
        profile, 
        profileStatus, 
        formConfig, 
        accessToken, 
        isLoading,
        logout, 
        fetchProfile, 
        fetchFormConfig, 
        fetchWithAuth,
        login,
        signup,
        forgotPassword,
        resetPassword,
        verifyOtp,
        resendOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
