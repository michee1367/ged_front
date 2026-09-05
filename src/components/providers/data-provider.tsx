"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

// --- TYPES ALIGNÉS SUR LA SPÉCIFICATION OPENAPI GED ---

export type Role =
  | "MINISTRE"
  | "CABINET"
  | "SECRETAIRE_GENERAL"
  | "DIRECTEUR"
  | "CHEF_DIVISION"
  | "AGENT"
  | "ADMINISTRATEUR";

export type Priorite = "NORMALE" | "URGENTE" | "TRES_URGENTE";
export const PIORITIES_LABELS: Record<Priorite, string> = {
  NORMALE: "Normale",
  URGENTE: "Urgent",
  TRES_URGENTE: "Trés urgent"
};
export type StatutDossier = "RECU" | "EN_TRAITEMENT" | "EN_ATTENTE" | "TRAITE" | "CLOTURE";
// Map pour formater les libellés d'affichage
export const ROLE_LABELS: Record<Role, string> = {
  MINISTRE: "Ministre",
  CABINET: "Cabinet",
  SECRETAIRE_GENERAL: "Secrétaire Général",
  DIRECTEUR: "Directeur",
  CHEF_DIVISION: "Chef de Division",
  AGENT: "Agent / Opérateur",
  ADMINISTRATEUR: "Administrateur System",
};

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
}

export interface ReponseDossier {
  idDossier?: number;
  numeroDossier?: string;
  objet?: string;
  dateReception?: string;
  echeance?: string;
  priorite?: Priorite;
  statutActuel?: StatutDossier;
  idAgent?: number;
  nomsAgent?: string;
  idService?: number;
  nomService?: string;
}
export interface ReponseReponse {
  idReponse?: number;
  dossier?: ReponseDossier;
  contenu?: string;
}
export interface ReponseCommentaire {
  idCommentaire?: number;
  dossier?: ReponseDossier;
  contenu?: string;
}

export interface HistoriqueTransmissionModel {
  idHistorique?: number;
  dateHeureTransmission?: string;
  actionEffectuee?: string;
  commentaire?: string;
  statutApresAction?: StatutDossier;
  expediteur?: UtilisateurModel;
  destinataire?: UtilisateurModel;
  serviceExpediteur?: ServiceModel;
  serviceDestinataire?: ServiceModel;
}

export interface ReponseDocument {
  idDocument?: number;
  nomFichier?: string;
  url?: string;
  dateAjout?: string;
  format?: string;
  idDossier?: number;
  objetDossier?: string;
  dateReception?: string;
}

export interface EnregistrerDossierCommand {
  objet: string;
  expediteurOrigineId?: number;
  echeance?: string;
  priorite?: Priorite;
}
export interface ModifierDossierCommand {
  objet: string;
  status?: StatutDossier;
  echeance?: string;
  priorite?: Priorite;
}

export interface TransmettreDossierCommand {
  idDossier?: number;
  idDestinateur?: number;
  idServiceDestinataire?: number;
  observation?: string;
}

interface GEDContextType {
  isReady: boolean;
  dossiers: ReponseDossier[];
  utilisateurs: UtilisateurModel[];
  services: ServiceModel[];
  
  // Actions Auth
  login: (username: string, password: string) => Promise<string>;
  loadServicesAndUtilisateurs: (page?: number, perPage?: number) => Promise<void>;
  // Actions Dossiers
  refreshDossiers: (page?: number, perPage?: number) => Promise<void>;
  getDossierById: (id: number) => Promise<ReponseDossier>;
  creerDossier: (command: EnregistrerDossierCommand) => Promise<ReponseDossier>;
  modifierDossier: (idSossier:number, command: ModifierDossierCommand) => Promise<ReponseDossier>;
  transmettreDossier: (id: number, command: TransmettreDossierCommand) => Promise<ReponseDossier>;
  repondreDossier: (idDossier: number, contenu: string) => Promise<ReponseDossier>;
  commenterDossier: (idDossier: number, contenu: string) => Promise<ReponseDossier>;
  getHistoriqueDossier: (id: number) => Promise<HistoriqueTransmissionModel[]>;
  
  // Actions Documents
  getDocumentsDossier: (dossierId: number) => Promise<ReponseDocument[]>;
  joindreDocument: (dossierId: number, titre: string, file: File) => Promise<ReponseDossier>;
  telechargerDocument: (documentId: number) => Promise<Blob>;
  // Action service
  
  getCommentaires: (dossierId: number) => Promise<ReponseCommentaire[]>;
  getReponse: (dossierId: number) => Promise<ReponseReponse>;

}

const GEDContext = createContext<GEDContextType | null>(null);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("jwt_token");
  console.log("################")
  console.log(token)
  console.log("#############")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function GEDProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [dossiers, setDossiers] = useState<ReponseDossier[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurModel[]>([]);
  const [services, setServices] = useState<ServiceModel[]>([]);

  // Chargement initial des données
  useEffect(() => {
    async function loadInitialData() {
      try {
        const headers = getAuthHeaders();
        const [resDossiers, resUsers, resServices] = await Promise.all([
          fetch(`${API_BASE_URL}/dossiers/?per_page=20`, { headers }),
          fetch(`${API_BASE_URL}/utilisateurs?per_page=100`, { headers }),
          fetch(`${API_BASE_URL}/services?per_page=100`, { headers }),
        ]);

        if (resDossiers.ok) {
          const data = await resDossiers.json();
          setDossiers(data.content || []);
        }
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUtilisateurs(data.content || []);
        }
        if (resServices.ok) {
          const data = await resServices.json();
          setServices(data.content || []);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'API GED", error);
      } finally {
        setIsReady(true);
      }
    }

    loadInitialData();
  }, []);

  // Auth: Login
  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Échec d'authentification");
    
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("jwt_token", data.accessToken);
    }
    return data.accessToken;
  }, []);

  // Rafraîchir la liste des dossiers
  const refreshDossiers = useCallback(async (page = 1, perPage = 50) => {
    const res = await fetch(`${API_BASE_URL}/dossiers/?page=${page}&per_page=${perPage}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setDossiers(data.content || []);
    }
  }, []);

  const loadServicesAndUtilisateurs = useCallback
     ( async (page = 1, perPage = 50) => {
      try {
        const headers = getAuthHeaders();
        const [resDossiers, resUsers, resServices] = await Promise.all([
          fetch(`${API_BASE_URL}/dossiers/?page=${page}&per_page=${perPage}`, { headers }),
          fetch(`${API_BASE_URL}/utilisateurs?per_page=100`, { headers }),
          fetch(`${API_BASE_URL}/services?per_page=100`, { headers }),
        ]);

        if (resDossiers.ok) {
          const data = await resDossiers.json();
          setDossiers(data.content || []);
        }
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUtilisateurs(data.content || []);
        }
        if (resServices.ok) {
          const data = await resServices.json();
          setServices(data.content || []);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'API GED", error);
      } finally {
        setIsReady(true);
      }
    }, []
  )

  // Obtenir un dossier par son ID
  const getDossierById = useCallback(async (id: number): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Dossier introuvable");
    return res.json();
  }, []);

  // Enregistrer un nouveau dossier
  const creerDossier = useCallback(async (command: EnregistrerDossierCommand): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(command),
    });
    if (!res.ok) throw new Error("Erreur lors de la création du dossier");
    const newDossier: ReponseDossier = await res.json();
    setDossiers((prev) => [newDossier, ...prev]);
    return newDossier;
  }, []);
  //
  // Enregistrer un nouveau dossier
  const modifierDossier = useCallback(async (idDossier:number, command: ModifierDossierCommand): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${idDossier}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(command),
    });
    if (!res.ok) throw new Error("Erreur lors de la création du dossier");
    const newDossier: ReponseDossier = await res.json();
    setDossiers((prev) => [newDossier, ...prev]);
    return newDossier;
  }, []);

  // Transmettre un dossier
  const transmettreDossier = useCallback(async (id: number, command: TransmettreDossierCommand): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${id}/transmettre`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(command),
    });
    if (!res.ok) throw new Error("Erreur lors de la transmission");
    const updated: ReponseDossier = await res.json();
    setDossiers((prev) => prev.map((d) => (d.idDossier === id ? updated : d)));
    return updated;
  }, []);

  // Répondre à un dossier
  const repondreDossier = useCallback(async (idDossier: number, contenu: string): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${idDossier}/repondre`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ contenu }),
    });
    if (!res.ok) throw new Error("Erreur lors de l'envoi de la réponse");
    const updated: ReponseDossier = await res.json();
    setDossiers((prev) => prev.map((d) => (d.idDossier === idDossier ? updated : d)));
    return updated;
  }, []);

  // Commenter un dossier
  const commenterDossier = useCallback(async (idDossier: number, contenu: string): Promise<ReponseDossier> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${idDossier}/commenter`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ contenu }),
    });
    if (!res.ok) throw new Error("Erreur lors de l'ajout du commentaire");
    const updated: ReponseDossier = await res.json();
    setDossiers((prev) => prev.map((d) => (d.idDossier === idDossier ? updated : d)));
    return updated;
  }, []);

  // Obtenir l'historique d'un dossier
  const getHistoriqueDossier = useCallback(async (id: number): Promise<HistoriqueTransmissionModel[]> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${id}/historiques`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur lors de la récupération de l'historique");
    const data = await res.json();
    return data.content || [];
  }, []);

  // Récupérer la liste des documents d'un dossier
  const getDocumentsDossier = useCallback(async (dossierId: number): Promise<ReponseDocument[]> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${dossierId}/documents?page=1&per_page=50`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de récupération des documents");
    const data = await res.json();
    return data.content || [];
  }, []);

  // Upload d'un fichier (`multipart/form-data`)
  const joindreDocument = useCallback(async (dossierId: number, titre: string, file: File): Promise<ReponseDossier> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    const formData = new FormData();
    formData.append("fichier", file);

    const res = await fetch(`${API_BASE_URL}/dossiers/${dossierId}/documents?titre=${encodeURIComponent(titre)}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Erreur d'envoi du document");
    return res.json();
  }, []);

  // Télécharger un document binaire
  const telechargerDocument = useCallback(async (documentId: number): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/documents/documents/${documentId}/download`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de téléchargement");
    return res.blob();
  }, []);

  // Récupérer la liste des documents d'un dossier
  const getCommentaires = useCallback(async (dossierId: number): Promise<ReponseCommentaire[]> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${dossierId}/commentaires?page=1&per_page=50`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de récupération des documents");
    const data = await res.json();
    return data.content || [];
  }, []);
  // Récupérer la liste des documents d'un dossier
  const getReponse = useCallback(async (dossierId: number): Promise<ReponseReponse> => {
    const res = await fetch(`${API_BASE_URL}/dossiers/${dossierId}/reponses`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de récupération des documents");
    const data = await res.json();
    return data || null;
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      dossiers,
      utilisateurs,
      services,
      login,
      loadServicesAndUtilisateurs,
      refreshDossiers,
      getDossierById,
      creerDossier,
      modifierDossier,
      transmettreDossier,
      repondreDossier,
      commenterDossier,
      getHistoriqueDossier,
      getDocumentsDossier,
      joindreDocument,
      telechargerDocument,
      
      getCommentaires,
      getReponse
    }),
    [
      isReady,
      dossiers,
      utilisateurs,
      services,
      loadServicesAndUtilisateurs,
      login,
      refreshDossiers,
      getDossierById,
      creerDossier,
      modifierDossier,
      transmettreDossier,
      repondreDossier,
      commenterDossier,
      getHistoriqueDossier,
      getDocumentsDossier,
      joindreDocument,
      telechargerDocument,
      getCommentaires,
      getReponse
    ]
  );

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Connexion à l&apos;API GED...</p>
        </div>
      </div>
    );
  }

  return <GEDContext.Provider value={value}>{children}</GEDContext.Provider>;
}

export function useGED() {
  const ctx = useContext(GEDContext);
  if (!ctx) throw new Error("useGED must be used within GEDProvider");
  return ctx;
}