"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";

// --- TYPES ALIGNÉS SUR LA SPÉCIFICATION OPENAPI GED ---

export type Role =
  | "MINISTRE"
  | "CABINET"
  | "SECRETAIRE_GENERAL"
  | "DIRECTEUR"
  | "CHEF_DIVISION"
  | "CHEF_BUREAU"
  | "SECRETAIRE_BUREAU"
  | "AGENT"
  | "ADMINISTRATEUR"
  | "VISIT";

export interface ServiceModel {
  idService?: number;
  nom?: string;
  code?: string;
}

export interface UtilisateurModel {
  idUtilisateur?: number;
  nom?: string;
  postNom?: string;
  prenom?: string;
  phoneNumber?: string;
  email?: string;
  roles?: Role[];
  actif?: boolean;
  service?: ServiceModel;
  avatar?: string;
}

export interface RegisterInput {
  nom: string;
  postNom?: string;
  prenom?: string;
  phoneNumber?: string;
  email: string;
  motDePasse: string;
  roles?: Role[];
  idService?: number;
}

interface AuthContextType {
  user: UtilisateurModel | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<UtilisateurModel>;
  registerPublic: (data: RegisterInput) => Promise<UtilisateurModel>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UtilisateurModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de la session au rechargement
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Connexion (`/auth/login`)
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = null;
        }
        throw new Error(errorData?.message || `Erreur de connexion (Code: ${res.status})`);
      }

      // ConnexionReponse: { accessToken: string, type: string }
      const data = await res.json();

      if (!data?.accessToken) {
        throw new Error("Jeton d'accès manquant dans la réponse du serveur.");
      }

      // Stockage du token JWT
      localStorage.setItem("jwt_token", data.accessToken);
      //const token = localStorage.getItem("jwt_token");

      // Déduction temporaire du profil utilisateur (ou récupération dédiée)
      const loggedUser: UtilisateurModel = {
        email: username,
        nom: username.split("@")[0],
        actif: true,
        avatar: "https://ui-avatars.com/api/?name=U&background=2563EB&color=fff&size=128",
      };

      setUser(loggedUser);
      localStorage.setItem("auth_user", JSON.stringify(loggedUser));

      return true;
    } catch (error) {
      console.error("Échec de la connexion :", error);
      throw error;
    }
  }, []);

  // Inscription (`/auth/enregistrer`)
  const register = useCallback(async (data: RegisterInput): Promise<UtilisateurModel> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
      const res = await fetch(`${API_BASE_URL}/utilisateurs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = null;
        }
        throw new Error(errorData?.message || `Erreur lors de l'enregistrement (Code: ${res.status})`);
      }

      // UtilisateurModel
      const newUser: UtilisateurModel = await res.json();
      return newUser;
    } catch (error) {
      console.error("Échec de l'enregistrement :", error);
      throw error;
    }
  }, []);

  // Inscription publique (`/auth/enregistrer`) — sans authentification
  const registerPublic = useCallback(async (data: RegisterInput): Promise<UtilisateurModel> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/enregistrer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = null;
        }
        throw new Error(errorData?.message || `Erreur lors de l'enregistrement public (Code: ${res.status})`);
      }

      // UtilisateurModel
      const newUser: UtilisateurModel = await res.json();
      return newUser;
    } catch (error) {
      console.error("Échec de l'enregistrement public :", error);
      throw error;
    }
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("jwt_token");
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, registerPublic, logout }),
    [user, isLoading, login, register, registerPublic, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}