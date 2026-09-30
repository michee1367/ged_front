"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";

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

/**
 * Niveau d'accès determined par l'API.
 *
 * Le JWT ne contient aucun claim de rôle (uniquement `sub`, `iat`, `exp` côté
 * `JwtUtils.generateToken`), et aucun endpoint ne renvoie le profil courant.
 * On se base donc sur la porte appliquée par le backend
 * (`NonVisiteurAuthorizationManager`) : toute requête hors `/auth/**` et
 * `GET /services` renvoie 403 pour un utilisateur `VISIT`.
 */
export type AccessLevel = "ANONYME" | "VISITEUR" | "AUTORISE";

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
  phoneNumber: string;
  email: string;
  motDePasse: string;
  roles?: Role[];
  idService?: number;
}

interface AuthContextType {
  user: UtilisateurModel | null;
  token: string | null;
  isLoading: boolean;
  accessLevel: AccessLevel;
  login: (username: string, password: string) => Promise<AccessLevel>;
  register: (data: RegisterInput) => Promise<UtilisateurModel>;
  registerPublic: (data: RegisterInput) => Promise<UtilisateurModel>;
  hydrateUser: (user: UtilisateurModel) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "auth_user";
const ACCESS_LEVEL_KEY = "auth_access_level";

function readStoredAccessLevel(): AccessLevel | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ACCESS_LEVEL_KEY);
  return raw === "VISITEUR" || raw === "AUTORISE" ? raw : null;
}

/** Sonde un endpoint protégé : 403 = utilisateur `VISIT`, sinon accès autorisé. */
async function probeAccessLevel(token: string): Promise<AccessLevel> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/kpis`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) return "VISITEUR";
    return "AUTORISE";
  } catch {
    // Réseau injoignable : on ne bloque pas la connexion.
    return "AUTORISE";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UtilisateurModel | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("ANONYME");

  const persistAccessLevel = useCallback((level: AccessLevel) => {
    setAccessLevel(level);
    if (typeof window === "undefined") return;
    if (level === "ANONYME") localStorage.removeItem(ACCESS_LEVEL_KEY);
    else localStorage.setItem(ACCESS_LEVEL_KEY, level);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setAccessLevel("ANONYME");
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("auth_token");
    localStorage.removeItem(ACCESS_LEVEL_KEY);
  }, []);

  // Conserve un profil complet connu (ex. réponse de `/auth/enregistrer`)
  const hydrateUser = useCallback((profile: UtilisateurModel) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
  }, []);

  // Restauration de la session au rechargement
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token || isTokenExpired(token)) {
      clearSession();
      setIsLoading(false);
      return;
    }

    setToken(token);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    const storedLevel = readStoredAccessLevel();

    if (storedLevel) {
      setAccessLevel(storedLevel);
      setIsLoading(false);
      return;
    }

    // Aucun niveau persisté (ancienne session) : on le redétermine.
    probeAccessLevel(token).then((level) => {
      persistAccessLevel(level);
      setIsLoading(false);
    });
  }, [clearSession, persistAccessLevel]);

  // Connexion (`/auth/login`)
  const login = useCallback(
    async (username: string, password: string): Promise<AccessLevel> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const token: string = data.accessToken;
        localStorage.setItem(TOKEN_KEY, token);
        setToken(token);

        // `/auth/login` ne renvoie que le token : le profil est reconstruit
        // localement, mais un profil complet déjà connu (fourni par
        // `/auth/enregistrer`) est conservé tel quel.
        const storedUser = localStorage.getItem(USER_KEY);
        const profile = storedUser
          ? ((() => {
              try {
                return JSON.parse(storedUser) as UtilisateurModel;
              } catch {
                return null;
              }
            })() ?? null)
          : null;

        if (!profile) {
          const subject = decodeJwtPayload(token)?.sub;
          hydrateUser({
            email: username,
            phoneNumber: typeof subject === "string" ? subject : undefined,
            nom: username.split("@")[0],
            actif: true,
            avatar: "https://ui-avatars.com/api/?name=U&background=2563EB&color=fff&size=128",
          });
        }

        const level = await probeAccessLevel(token);
        persistAccessLevel(level);

        return level;
      } catch (error) {
        console.error("Échec de la connexion :", error);
        throw error;
      }
    },
    [hydrateUser, persistAccessLevel]
  );

  // Inscription (`/utilisateurs`) — réservée aux administrateurs
  const register = useCallback(async (data: RegisterInput): Promise<UtilisateurModel> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
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
        headers: { "Content-Type": "application/json" },
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

      // UtilisateurModel — la réponse contient `roles` et `service`.
      const newUser: UtilisateurModel = await res.json();

      // Le backend force `roles = ["VISIT"]` : le niveau est donc connu sans sondage.
      if (newUser.roles?.includes("VISIT")) {
        persistAccessLevel("VISITEUR");
      }

      return newUser;
    } catch (error) {
      console.error("Échec de l'enregistrement public :", error);
      throw error;
    }
  }, [persistAccessLevel]);

  // Déconnexion
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, token, isLoading, accessLevel, login, register, registerPublic, hydrateUser, logout }),
    [user, token, isLoading, accessLevel, login, register, registerPublic, hydrateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
